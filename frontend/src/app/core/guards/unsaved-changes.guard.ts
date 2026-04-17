import { CanDeactivateFn } from '@angular/router';

// This interface allows us to reuse this guard on any component that implements this property
export interface HasUnsavedChanges {
  hasUnsavedChanges: boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.hasUnsavedChanges) {
    // Triggers the native browser confirmation dialog
    return confirm(
      'You have unsaved changes. Are you sure you want to leave this page? Your progress will be lost.',
    );
  }
  return true;
};
