import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import CreatorPage from "./pages/CreatorPage";
import EditerPage from "./pages/EditerPage";
import CameraPage from "./pages/CameraPage";
import ScenePage from "./pages/ScenePage";
import AudioPage from "./pages/AudioPage";
import ThreeDStudioPage from "./pages/ThreeDStudioPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/creator" element={<CreatorPage />} />
          <Route path="/editer" element={<EditerPage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/scene" element={<ScenePage />} />
          <Route path="/audio" element={<AudioPage />} />
          <Route path="/3d-studio" element={<ThreeDStudioPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Legacy aliases */}
          <Route path="/content-editor" element={<Navigate to="/creator" replace />} />
          <Route path="/content-studio" element={<Navigate to="/editer" replace />} />
          <Route path="/camera-engine"  element={<Navigate to="/camera"  replace />} />
          <Route path="/scene-master"   element={<Navigate to="/scene"   replace />} />
          <Route path="/audio-engine"   element={<Navigate to="/audio"   replace />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
