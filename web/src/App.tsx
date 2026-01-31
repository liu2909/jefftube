import { Routes, Route } from "react-router";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { ChannelPage } from "./pages/channel/ChannelPage";
import { VideoPage } from "./components/video/VideoPage";
import { ShortsPage } from "./pages/shorts/ShortsPage";
import { NotFoundPage } from "./components/NotFoundPage";

function App() {
  return (
    <div className="min-h-screen bg-(--color-bg-primary) text-(--color-text-primary)">
      <Header />
      <Sidebar />
      <Routes>
        <Route path="/" element={<ChannelPage />} />
        <Route path="/watch/:videoId" element={<VideoPage />} />
        <Route path="/shorts" element={<ShortsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
