import { Route, Routes } from "react-router-dom";
import { CreateVideoPage } from "./components/create/CreateVideoPage";
import { GeneratingAgentPage } from "./components/create/GeneratingAgentPage";
import { RemotionHandoffPage } from "./components/create/RemotionHandoffPage";
import { VideoPreviewPage } from "./components/create/VideoPreviewPage";
import { HomePage } from "./components/home/HomePage";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { SettingsPage } from "./components/settings/SettingsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<CreateVideoPage />} />
      <Route path="/create/generate" element={<GeneratingAgentPage />} />
      <Route path="/create/remotion" element={<RemotionHandoffPage />} />
      <Route path="/create/video" element={<VideoPreviewPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
