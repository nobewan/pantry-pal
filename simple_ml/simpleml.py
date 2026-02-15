import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

import joblib

#config

DATA_FILE = "./data/combined_dataset.csv"
MODEL_NAME = "pantrypal_model.pkl"


def load_dataset(filepath):
    df = pd.read_csv(filepath)

    if "label" not in df.columns:
        raise ValueError("No 'label' column found in dataset.")

    print("Loaded dataset shape:", df.shape)
    print("\nClass distribution:")
    print(df["label"].value_counts())

    return df


def clean_data(data):
    # Drop timestamp if exists
    if "timestamp" in data.columns:
        data = data.drop(columns=["timestamp"])

    # Drop notes (not numeric)
    if "notes" in data.columns:
        data = data.drop(columns=["notes"])

    # Separate features + label
    y = data["label"]
    X = data.drop(columns=["label"])

    # Keep only numeric columns
    X = X.select_dtypes(include=[np.number])

    # Remove fully empty rows
    X = X.dropna(how="all")

    # Fill remaining NaNs
    X = X.fillna(X.mean())

    if X.shape[0] == 0:
        raise ValueError("No usable data after cleaning.")

    return X, y.loc[X.index]

import matplotlib.pyplot as plt
import seaborn as sns

#train model

def train_model(X, y):
    unique_classes = y.nunique()
    stratify_option = y if unique_classes > 1 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=stratify_option
    )

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(
            max_iter=5000,
            class_weight="balanced"
        ))
    ])

    model.fit(X_train, y_train)

    if unique_classes > 1:
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        print("\nAccuracy:", acc)

        print("\nClassification Report:\n")
        print(classification_report(y_test, y_pred, zero_division=0))

        cm = confusion_matrix(y_test, y_pred)
        print("\nConfusion Matrix:\n")
        print(cm)

        # Heatmap
        plt.figure()
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            xticklabels=model.classes_,
            yticklabels=model.classes_
        )
        plt.xlabel("Predicted")
        plt.ylabel("Actual")
        plt.title("Confusion Matrix Heatmap")
        plt.tight_layout()
        plt.show()

    return model

def main():
    data = load_dataset(DATA_FILE)

    X, y = clean_data(data)
    print("\nClean dataset shape:", X.shape)

    model = train_model(X, y)

    joblib.dump(model, MODEL_NAME)
    print(f"\nModel saved as {MODEL_NAME}")


if __name__ == "__main__":
    main()
