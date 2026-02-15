#!/usr/bin/env python3
import time
import cv2
import numpy as np
import onnxruntime as ort

from picamera2 import Picamera2
from picamera2.devices import IMX500
from picamera2.devices.imx500 import NetworkIntrinsics, postprocess_nanodet_detection

# ---------------- ONNX fruit-quality classifier ----------------

ONNX_MODEL = "/home/mechatronlabs25/mobilenet_fruit.onnx"

CLASSES = [
    "fresh_apple",
    "fresh_banana",
    "fresh_bitter_gourd",
    "fresh_capsicum",
    "fresh_orange",
    "fresh_tomato",
    "stale_apple",
    "stale_banana",
    "stale_bitter_gourd",
    "stale_capsicum",
    "stale_orange",
    "stale_tomato",
]

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
FRUIT_INPUT_SIZE = 224

def softmax(x: np.ndarray) -> np.ndarray:
    x = x - np.max(x, axis=1, keepdims=True)
    e = np.exp(x)
    return e / np.sum(e, axis=1, keepdims=True)

def preprocess_crop_bgr_to_nchw(crop_bgr: np.ndarray, size: int = 224) -> np.ndarray:
    # Model expects RGB + ImageNet normalization; keep display in BGR
    rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
    rgb = cv2.resize(rgb, (size, size), interpolation=cv2.INTER_LINEAR)
    x = rgb.astype(np.float32) / 255.0
    x = (x - MEAN) / STD
    x = np.transpose(x, (2, 0, 1))
    x = np.expand_dims(x, axis=0).astype(np.float32)
    return x

def classify_crop(sess: ort.InferenceSession, crop_bgr: np.ndarray):
    x = preprocess_crop_bgr_to_nchw(crop_bgr, FRUIT_INPUT_SIZE)
    inp_name = sess.get_inputs()[0].name
    logits = sess.run(None, {inp_name: x})[0]  # (1,12)
    probs = softmax(logits)
    idx = int(np.argmax(probs, axis=1)[0])
    conf = float(probs[0, idx])
    quality, fruit = CLASSES[idx].split("_", 1)  # fresh/stale + fruit
    return fruit, quality, conf

# ---------------- IMX500 detector config ----------------

# MODEL_RPK = "/usr/share/imx500-models/imx500_network_nanodet_plus_416x416_pp.rpk"
MODEL_RPK = "/usr/share/imx500-models/imx500_network_ssd_mobilenetv2_fpnlite_320x320_pp.rpk"

COCO_CLASSES = [
    "person","bicycle","car","motorcycle","airplane","bus","train","truck","boat","traffic light",
    "fire hydrant","-","stop sign","parking meter","bench","bird","cat","dog","horse","sheep","cow",
    "elephant","bear","zebra","giraffe","-","backpack","umbrella","-","-","handbag","tie","suitcase",
    "frisbee","skis","snowboard","sports ball","kite","baseball bat","baseball glove","skateboard",
    "surfboard","tennis racket","bottle","-","wine glass","cup","fork","knife","spoon","bowl","banana",
    "apple","sandwich","orange","broccoli","carrot","hot dog","pizza","donut","cake","chair","couch",
    "potted plant","bed","-","dining table","-","-","toilet","-","tv","laptop","mouse","remote",
    "keyboard","cell phone","microwave","oven","toaster","sink","refrigerator","-","book","clock","vase",
    "scissors","teddy bear","hair drier","toothbrush"
]

FOOD_CLASS_IDS = {51, 52, 53, 54, 55, 56, 57, 58, 59, 60}  # banana..cake

# Classifier-supported COCO fruits: banana, apple, orange
COCO_FRUIT_IDS = {51, 52, 54}

# ---------------- Runtime knobs / toggles ----------------

PREVIEW_SIZE = (640, 480)

# Detection filters
FILTER_FOOD_ONLY = True                 # toggle with 'f'
ONLY_CLASSIFY_SUPPORTED = True          # default ON; toggle with 'c'

# What to display / compute
SHOW_DETECTIONS = True                  # toggle with 'd' (draw boxes+labels)
ENABLE_QUALITY_AND_INVENTORY = True     # toggle with 'm' (runs ONNX + inventory)

# Inventory mode toggle
INVENTORY_MODE = "visible"              # toggle with 'i' ("visible" or "total")

TARGET_FPS = 10                         # UI loop rate
CLASSIFIER_HZ = 4.0                     # max classifier inferences per second (global)

CROP_PAD_FRAC = 0.08

# Tracking for "currently visible" inventory
TRACK_TTL_S = 1.5                       # remove track if not seen for this long
IOU_MATCH_THR = 0.3
TRACK_RECLASSIFY_S = 0.8                # per-track classify period

# ---------------- utilities ----------------

def label_for(class_id: int) -> str:
    if 0 <= class_id < len(COCO_CLASSES):
        return COCO_CLASSES[class_id]
    return f"id={class_id}"

def clamp(v, lo, hi):
    return max(lo, min(hi, v))

def pad_xyxy(x0, y0, x1, y1, W, H, pad_frac):
    w = x1 - x0
    h = y1 - y0
    px = int(w * pad_frac)
    py = int(h * pad_frac)
    x0p = clamp(x0 - px, 0, W - 1)
    y0p = clamp(y0 - py, 0, H - 1)
    x1p = clamp(x1 + px, 0, W)
    y1p = clamp(y1 + py, 0, H)
    return x0p, y0p, x1p, y1p

def xywh_to_xyxy(b):
    x, y, w, h = b
    return (x, y, x + w, y + h)

def iou_xyxy(a, b):
    ax0, ay0, ax1, ay1 = a
    bx0, by0, bx1, by1 = b
    ix0, iy0 = max(ax0, bx0), max(ay0, by0)
    ix1, iy1 = min(ax1, bx1), min(ay1, by1)
    iw, ih = max(0, ix1 - ix0), max(0, iy1 - iy0)
    inter = iw * ih
    if inter <= 0:
        return 0.0
    area_a = max(0, ax1 - ax0) * max(0, ay1 - ay0)
    area_b = max(0, bx1 - bx0) * max(0, by1 - by0)
    denom = area_a + area_b - inter
    return float(inter) / float(denom) if denom > 0 else 0.0

def compute_visible_inventory(tracks):
    inv = {}  # fruit -> {"fresh": n, "stale": n}
    for tr in tracks.values():
        fruit = tr.get("fruit")
        quality = tr.get("quality")
        if not fruit or not quality:
            continue
        rec = inv.setdefault(fruit, {"fresh": 0, "stale": 0})
        if quality == "fresh":
            rec["fresh"] += 1
        else:
            rec["stale"] += 1
    return inv

def draw_inventory_panel(img_bgr, inv, mode: str, x=8, y=18, line_h=16):
    items = [(fruit, rec.get("fresh", 0), rec.get("stale", 0)) for fruit, rec in inv.items()]
    items.sort(key=lambda t: t[0])

    lines = [f"Inventory ({mode})"] + [f"{fruit}: fresh={fresh} stale={stale}" for fruit, fresh, stale in items]

    w = 0
    for s in lines:
        (tw, _), _ = cv2.getTextSize(s, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
        w = max(w, tw)
    h = line_h * len(lines) + 8
    w = w + 16

    cv2.rectangle(img_bgr, (x - 4, y - 14), (x + w, y - 14 + h), (0, 0, 0), thickness=-1)
    yy = y
    for s in lines:
        cv2.putText(img_bgr, s, (x, yy), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
        yy += line_h

def draw_status_bar(img_bgr):
    global FILTER_FOOD_ONLY, ONLY_CLASSIFY_SUPPORTED, SHOW_DETECTIONS, ENABLE_QUALITY_AND_INVENTORY, INVENTORY_MODE
    msg = (
        f"[f]food_only={FILTER_FOOD_ONLY}  "
        f"[c]cls_supported_only={ONLY_CLASSIFY_SUPPORTED}  "
        f"[d]show_det={SHOW_DETECTIONS}  "
        f"[m]quality+inv={ENABLE_QUALITY_AND_INVENTORY}  "
        f"[i]inv_mode={INVENTORY_MODE}  "
        f"[q]quit"
    )
    cv2.putText(
        img_bgr, msg,
        (8, img_bgr.shape[0] - 10),
        cv2.FONT_HERSHEY_SIMPLEX, 0.45,
        (255, 255, 255), 1, cv2.LINE_AA
    )

# ---------------- IMX500 parsing ----------------

class Detection:
    def __init__(self, coords_yxyx, category, conf, metadata, imx500, picam2):
        self.category = int(category)
        self.conf = float(conf)
        self.box = imx500.convert_inference_coords(coords_yxyx, metadata, picam2)  # (x,y,w,h)

def parse_detections(metadata, imx500, picam2, intrinsics, threshold=0.45, iou=0.65, max_detections=10):
    np_outputs = imx500.get_outputs(metadata, add_batch=True)
    if np_outputs is None:
        return []

    input_w, input_h = imx500.get_input_size()

    if intrinsics.postprocess == "nanodet":
        boxes, scores, classes = postprocess_nanodet_detection(
            outputs=np_outputs[0],
            conf=threshold,
            iou_thres=iou,
            max_out_dets=max_detections
        )[0]
        from picamera2.devices.imx500.postprocess import scale_boxes
        boxes = scale_boxes(boxes, 1, 1, input_h, input_w, False, False)
    else:
        boxes, scores, classes = np_outputs[0][0], np_outputs[1][0], np_outputs[2][0]

    if getattr(intrinsics, "bbox_normalization", False):
        boxes = boxes / input_h

    bbox_order = getattr(intrinsics, "bbox_order", "yx")
    if bbox_order == "xy":
        boxes = boxes[:, [1, 0, 3, 2]]

    dets = []
    for box, score, category in zip(boxes, scores, classes):
        if float(score) < threshold:
            continue
        dets.append(Detection(box, category, score, metadata, imx500, picam2))
    return dets

# ---------------- main ----------------

def main():
    global FILTER_FOOD_ONLY, ONLY_CLASSIFY_SUPPORTED, SHOW_DETECTIONS, ENABLE_QUALITY_AND_INVENTORY, INVENTORY_MODE

    # ORT session (only if we may use it)
    so = ort.SessionOptions()
    so.log_severity_level = 3
    sess = ort.InferenceSession(ONNX_MODEL, sess_options=so, providers=["CPUExecutionProvider"])

    # IMX500 detector
    imx500 = IMX500(MODEL_RPK)
    intrinsics = imx500.network_intrinsics
    if not intrinsics:
        intrinsics = NetworkIntrinsics()
        intrinsics.task = "object detection"
    intrinsics.update_with_defaults()

    picam2 = Picamera2(imx500.camera_num)

    # Verified working on your system
    config = picam2.create_preview_configuration(
        main={"size": PREVIEW_SIZE, "format": "BGR888"},
        controls={"FrameRate": 30},
        buffer_count=6
    )

    try:
        imx500.show_network_fw_progress_bar()
    except Exception:
        pass

    picam2.start(config, show_preview=False)

    # timing
    dt_target = 1.0 / max(TARGET_FPS, 1)
    last_loop_t = 0.0

    # Token bucket for classifier (global rate limit)
    tokens = 0.0
    last_token_t = time.time()

    # Tracks for visible inventory
    tracks = {}          # tid -> dict
    next_tid = 1

    # Totals inventory (track-based, not frame-based)
    totals = {}          # fruit -> {"fresh": n, "stale": n}

    print("Keys: q=quit, f=toggle food-only, c=toggle classify-supported-only, d=toggle det overlay, "
          "m=toggle quality+inventory, i=toggle inventory mode")

    try:
        while True:
            now = time.time()
            if now - last_loop_t < dt_target:
                time.sleep(0.001)
                continue
            last_loop_t = now

            # refill classifier tokens
            tnow = time.time()
            tokens += (tnow - last_token_t) * CLASSIFIER_HZ
            last_token_t = tnow
            tokens = min(tokens, CLASSIFIER_HZ * 2.0)

            request = picam2.capture_request()
            try:
                metadata = request.get_metadata()
                frame_rgb = request.make_array("main")
                frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_BGR2RGB)
                H, W, _ = frame_bgr.shape

                dets = parse_detections(metadata, imx500, picam2, intrinsics)

                # Candidate detections to track (respect food filter)
                cand = []
                for det in dets:
                    if FILTER_FOOD_ONLY and det.category not in FOOD_CLASS_IDS:
                        continue
                    x, y, w, h = map(int, det.box)
                    if w <= 0 or h <= 0:
                        continue
                    bb = xywh_to_xyxy((x, y, w, h))
                    cand.append((det, bb))

                # If quality/inventory is disabled, we can skip tracking/classification
                if ENABLE_QUALITY_AND_INVENTORY:
                    # Expire old tracks
                    for tid in list(tracks.keys()):
                        if now - tracks[tid]["last_seen"] > TRACK_TTL_S:
                            del tracks[tid]

                    # Greedy match existing tracks to detections
                    used = set()
                    for tid, tr in list(tracks.items()):
                        best_iou = 0.0
                        best_j = None
                        for j, (_, bb) in enumerate(cand):
                            if j in used:
                                continue
                            v = iou_xyxy(tr["bbox"], bb)
                            if v > best_iou:
                                best_iou, best_j = v, j
                        if best_j is not None and best_iou >= IOU_MATCH_THR:
                            det, bb = cand[best_j]
                            used.add(best_j)
                            tr["bbox"] = bb
                            tr["det_category"] = int(det.category)
                            tr["det_conf"] = float(det.conf)
                            tr["last_seen"] = now

                    # New tracks for unmatched detections
                    for j, (det, bb) in enumerate(cand):
                        if j in used:
                            continue
                        tracks[next_tid] = {
                            "bbox": bb,
                            "det_category": int(det.category),
                            "det_conf": float(det.conf),
                            "last_seen": now,
                            "fruit": None,
                            "quality": None,
                            "conf": None,
                            "last_classified": 0.0,
                        }
                        next_tid += 1
                else:
                    # Not running tracking/inventory; treat detections as transient for drawing only
                    tracks.clear()

                # ---- Drawing / Captioning ----
                # If quality is enabled, draw from tracks (stable IDs); otherwise draw from detections.
                if SHOW_DETECTIONS:
                    if ENABLE_QUALITY_AND_INVENTORY:
                        # Draw + classify tracks
                        for tid, tr in tracks.items():
                            x0, y0, x1, y1 = tr["bbox"]
                            x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)
                            x0, y0 = max(0, x0), max(0, y0)
                            x1, y1 = min(W, x1), min(H, y1)

                            det_cat = tr.get("det_category", -1)
                            det_name = label_for(det_cat)

                            cv2.rectangle(frame_bgr, (x0, y0), (x1, y1), (0, 255, 0), 2)

                            # Classification gating
                            should_classify = True
                            if ONLY_CLASSIFY_SUPPORTED and det_cat not in COCO_FRUIT_IDS:
                                should_classify = False

                            # Periodic reclassification per track + global token throttle
                            if should_classify and tokens >= 1.0 and (now - tr["last_classified"] >= TRACK_RECLASSIFY_S):
                                x0p, y0p, x1p, y1p = pad_xyxy(x0, y0, x1, y1, W, H, CROP_PAD_FRAC)
                                crop_bgr = frame_bgr[y0p:y1p, x0p:x1p]

                                prev_fruit = tr.get("fruit")
                                prev_quality = tr.get("quality")

                                try:
                                    fruit, quality, conf = classify_crop(sess, crop_bgr)
                                    tokens -= 1.0
                                    tr["fruit"] = fruit
                                    tr["quality"] = quality
                                    tr["conf"] = conf

                                    # Update totals on change (track-based, not frame-based)
                                    if (prev_fruit, prev_quality) != (fruit, quality):
                                        if prev_fruit and prev_quality in ("fresh", "stale"):
                                            rec = totals.setdefault(prev_fruit, {"fresh": 0, "stale": 0})
                                            rec[prev_quality] = max(0, rec.get(prev_quality, 0) - 1)
                                        rec = totals.setdefault(fruit, {"fresh": 0, "stale": 0})
                                        rec[quality] = rec.get(quality, 0) + 1

                                except Exception:
                                    tr["fruit"] = None
                                    tr["quality"] = None
                                    tr["conf"] = None

                                tr["last_classified"] = now

                            # Caption
                            if tr.get("fruit") and tr.get("quality") and tr.get("conf") is not None:
                                caption = f"{det_name} | {tr['quality']}_{tr['fruit']} ({tr['conf']:.2f})"
                            else:
                                if ONLY_CLASSIFY_SUPPORTED and det_cat not in COCO_FRUIT_IDS:
                                    caption = det_name
                                else:
                                    caption = f"{det_name} | (unclassified)"

                            cv2.putText(
                                frame_bgr, caption,
                                (x0, max(0, y0 - 7)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45,
                                (0, 255, 255), 1, cv2.LINE_AA
                            )
                    else:
                        # Draw raw detections only (no quality/inventory)
                        for det, bb in cand:
                            x0, y0, x1, y1 = bb
                            x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)
                            det_name = label_for(det.category)
                            cv2.rectangle(frame_bgr, (x0, y0), (x1, y1), (0, 255, 0), 2)
                            cv2.putText(
                                frame_bgr, f"{det_name} {det.conf:.2f}",
                                (x0, max(0, y0 - 7)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45,
                                (0, 255, 255), 1, cv2.LINE_AA
                            )

                # Inventory panel (only when quality/inventory is enabled)
                if ENABLE_QUALITY_AND_INVENTORY:
                    if INVENTORY_MODE == "visible":
                        inv = compute_visible_inventory(tracks)
                    else:
                        inv = totals
                    draw_inventory_panel(frame_bgr, inv, INVENTORY_MODE, x=8, y=18)

                draw_status_bar(frame_bgr)
                cv2.imshow("full_frame", frame_bgr)

                key = cv2.waitKey(1) & 0xFF
                if key == ord("q"):
                    break
                elif key == ord("f"):
                    FILTER_FOOD_ONLY = not FILTER_FOOD_ONLY
                    print(f"FILTER_FOOD_ONLY={FILTER_FOOD_ONLY}")
                elif key == ord("c"):
                    ONLY_CLASSIFY_SUPPORTED = not ONLY_CLASSIFY_SUPPORTED
                    print(f"ONLY_CLASSIFY_SUPPORTED={ONLY_CLASSIFY_SUPPORTED}")
                elif key == ord("d"):
                    SHOW_DETECTIONS = not SHOW_DETECTIONS
                    print(f"SHOW_DETECTIONS={SHOW_DETECTIONS}")
                elif key == ord("m"):
                    ENABLE_QUALITY_AND_INVENTORY = not ENABLE_QUALITY_AND_INVENTORY
                    print(f"ENABLE_QUALITY_AND_INVENTORY={ENABLE_QUALITY_AND_INVENTORY}")
                elif key == ord("i"):
                    INVENTORY_MODE = "total" if INVENTORY_MODE == "visible" else "visible"
                    print(f"INVENTORY_MODE={INVENTORY_MODE}")

            finally:
                request.release()

    finally:
        picam2.stop()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

