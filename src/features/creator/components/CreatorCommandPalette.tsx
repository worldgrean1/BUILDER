import { Boxes, Copy, Crosshair, Frame, MousePointer2, Trash2 } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { CREATOR_FRAME_PRESETS, CREATOR_INSERT_ITEMS } from '@/features/creator/mockDocument';
import { creatorActions, useCreatorStore } from '@/features/creator/store';

const CreatorCommandPalette = () => {
  const open = useCreatorStore((state) => state.commandPaletteOpen);
  const selectionIds = useCreatorStore((state) => state.selectionIds);
  const document = useCreatorStore((state) => state.document);

  const selectedId = selectionIds[0];

  return (
    <CommandDialog open={open} onOpenChange={(nextOpen) => creatorActions.toggleCommandPalette(nextOpen)}>
      <CommandInput placeholder="Search actions, layers, and inserts..." />
      <CommandList>
        <CommandEmpty>No matching actions.</CommandEmpty>

        <CommandGroup heading="Tools">
          <CommandItem onSelect={() => creatorActions.setActiveTool('select')}>
            <MousePointer2 className="mr-2 h-4 w-4" /> Select tool
          </CommandItem>
          <CommandItem onSelect={() => creatorActions.focusSelection()}>
            <Crosshair className="mr-2 h-4 w-4" /> Focus selection
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Insert">
          {CREATOR_INSERT_ITEMS.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => {
                creatorActions.insertNode(item.type, { x: 120, y: 120 });
                creatorActions.toggleCommandPalette(false);
              }}
            >
              <Boxes className="mr-2 h-4 w-4" /> Add {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Frames">
          {CREATOR_FRAME_PRESETS.map((preset) => (
            <CommandItem
              key={preset.id}
              onSelect={() => {
                creatorActions.setFramePreset(preset.id);
                creatorActions.toggleCommandPalette(false);
              }}
            >
              <Frame className="mr-2 h-4 w-4" /> {preset.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {selectedId && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Selection">
              <CommandItem onSelect={() => creatorActions.duplicateNode(selectedId)}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate {document.nodes[selectedId]?.name}
              </CommandItem>
              <CommandItem onSelect={() => creatorActions.deleteNode(selectedId)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete {document.nodes[selectedId]?.name}
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Layers">
          {Object.values(document.nodes)
            .filter((node) => node.id !== document.rootId)
            .slice(0, 12)
            .map((node) => (
              <CommandItem
                key={node.id}
                onSelect={() => {
                  creatorActions.selectNode(node.id);
                  creatorActions.focusSelection();
                  creatorActions.toggleCommandPalette(false);
                }}
              >
                {node.name}
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CreatorCommandPalette;

