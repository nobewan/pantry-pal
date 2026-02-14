import { Tabs, TabList, Tab } from "react-tabs";
import { useNavigate, useLocation } from "react-router-dom";

export default function NavTabs() {
    const navigate = useNavigate();
    const location = useLocation();
  
    const routes = ["/", "/foodMonitor"];
    const activeIndex = routes.indexOf(location.pathname);
  
    return (
      <div className="bg-green-400 shadow-sm px-6 py-4">
        
        {/* Row container */}
        <div className="flex items-center">
  
          {/* LEFT: Title */}
          <div className="text-white">
            <h1 className="text-2xl font-bold">Pantry Pal</h1>
            <p className="text-sm">Camera tracker for food</p>
          </div>
  
          {/* RIGHT: Tabs */}
          <Tabs
            selectedIndex={activeIndex === -1 ? 0 : activeIndex}
            onSelect={(index) => navigate(routes[index])}
          >
            <TabList className="flex space-x-6 ml-6">
              <Tab
                className="px-4 py-2 text-gray-700 font-medium cursor-pointer"
                selectedClassName="text-blue-600 border-b-2 border-blue-600"
              >
                1stTab
              </Tab>
  
              <Tab
                className="px-4 py-2 text-gray-700 font-medium cursor-pointer"
                selectedClassName="text-blue-600 border-b-2 border-blue-600"
              >
                2ndTab
              </Tab>
            </TabList>
          </Tabs>
  
        </div>
      </div>
    );
  }
