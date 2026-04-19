# Translink CMS — Component Structure & Architecture

This document serves as the official mapping of the Translink CMS User Interface components and pages.

## 🌍 Shared Components
These components are global building blocks. Modifying these will propagate changes across multiple pages in the application.

*   **`layout/PageLayout.tsx`**: The main page wrapper, utilized by almost all pages to maintain consistent structural layout.
*   **`cms/TopBar.tsx`**: The primary header navigation bar. (Used by ThreeDStudio, Scene, Editer, Camera, and Audio).
*   **`cms/ScrollBar.tsx`**: Custom scrollbar overlay styling. (Used by Scene, Editer, and Camera).
*   **`features/settings/components/SettingsModal.tsx`**: The unified settings modal popup.

---

## 📄 Pages and Page-Specific Components
These are the main routes of the application and the dedicated components they import to build their specific functionality.

### 1. Editer Page (`EditerPage.tsx`)
The primary content editing interface.
*   `cms/NavigationTree.tsx`
*   `cms/AccordionSection.tsx`
*   `cms/FieldRow.tsx`
*   `cms/ColorSwatch.tsx`

### 2. Creator Page (`CreatorPage.tsx`)
The isolated creative toolkit feature set.
*   `features/creator/components/CreatorCanvas.tsx`
*   `features/creator/components/CreatorCommandPalette.tsx`
*   `features/creator/components/CreatorInspector.tsx`
*   `features/creator/components/CreatorSidebar.tsx`
*   `features/creator/components/CreatorTopBar.tsx`

### 3. 3D Studio Page (`ThreeDStudioPage.tsx`)
The deterministic, 3D manipulation studio pipeline.
*   `studio/ObjectHierarchyPanel.tsx`
*   `studio/StudioViewport.tsx`
*   `studio/ObjectPropertiesPanel.tsx`
*   `studio/RenderSettingsPanel.tsx`
*   `studio/AnimationPanel.tsx`
*   `studio/StudioTimeline.tsx`

### 4. Camera Page (`CameraPage.tsx`)
The interface for manipulating virtual or physical camera feeds and telemetry.
*   `camera/CameraNavigationTree.tsx`
*   `camera/LiveTelemetry.tsx`
*   `camera/KeyframeCard.tsx`

### 5. Scene Page (`ScenePage.tsx`)
The layout controller for arranging the scene logic and materials.
*   `scene/SceneNavigationTree.tsx`
*   `scene/SceneMaterialInspector.tsx`

### 6. Audio Page (`AudioPage.tsx`)
The mixing and spatial audio pipeline inspector.
*   `audio/AudioSystemPanel.tsx`
*   `audio/SpatialAudioInspector.tsx`
*   `audio/MixerTimeline.tsx`

### General Utility Pages
These pages primarily utilize standard HTML elements or the global `PageLayout`, rather than having exclusive custom feature components.
*   **`Index.tsx`**
*   **`NotFound.tsx`**
*   **`SettingsPage.tsx`**
