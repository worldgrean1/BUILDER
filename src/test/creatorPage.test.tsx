import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import CreatorPage from '@/pages/CreatorPage';
import { creatorActions, creatorStore } from '@/features/creator/store';

describe('CreatorPage', () => {
  beforeEach(() => {
    creatorActions.reset();
  });

  it('renders the visual engine shell', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CreatorPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Layers')).toBeInTheDocument();
    expect(screen.getByText(/Open Visual Engine/i)).toBeInTheDocument();
  });

  it('handles keyboard nudge interactions on canvas selection', () => {
    creatorActions.setSnapEnabled(false);
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CreatorPage />
      </MemoryRouter>,
    );

    const before = creatorStore.getState().document.nodes['text-title'].layout.x;
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(creatorStore.getState().document.nodes['text-title'].layout.x).toBe(before + 1);

    fireEvent.keyDown(window, { key: 'ArrowRight', shiftKey: true });
    expect(creatorStore.getState().document.nodes['text-title'].layout.x).toBe(before + 11);
  });

  it('updates inspector align control', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CreatorPage />
      </MemoryRouter>,
    );

    // Navigate to Style tab where Align now lives
    const styleTabs = screen.getAllByText('Style');
    const inspectorStyleTab = styleTabs.find((el) => el.closest('button'));
    if (inspectorStyleTab) fireEvent.click(inspectorStyleTab);

    const alignLabel = screen.getByText('Align');
    const alignSelect = alignLabel.closest('label')?.querySelector('select') as HTMLSelectElement | null;
    expect(alignSelect).toBeTruthy();
    if (!alignSelect) return;

    fireEvent.change(alignSelect, { target: { value: 'center' } });
    expect(creatorStore.getState().document.nodes['text-title'].style.textAlign).toBe('center');
  });

  it('shows insert panel with widget grid', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CreatorPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Insert'));

    // Verify some widget labels are present in the grid
    expect(screen.getByText('3D')).toBeInTheDocument();
    expect(screen.getByText('Embed')).toBeInTheDocument();

    // Click a widget button to arm create mode
    fireEvent.click(screen.getByText('3D'));
    expect(creatorStore.getState().activeTool).toBe('select');
    // Since we're not in create mode, clicking inserts directly at (120,120)
  });
});
