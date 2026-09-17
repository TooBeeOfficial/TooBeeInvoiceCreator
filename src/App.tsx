/* The window.

   A rail across the top, one page under it, and the three things that can
   appear over everything: a confirmation, the shortcut list, and whatever
   the app has just said. Nothing else — every other decision belongs to a
   page or to a component inside one. */

import { usePrefsStore } from '@store/usePrefsStore'
import { useUiStore } from '@store/useUiStore'
import { useAppTheme } from '@hooks/useAppTheme'
import { useShortcuts } from '@hooks/useShortcuts'
import { useBootstrap } from '@hooks/useBootstrap'
import { TopRail } from '@components/TopRail/TopRail'
import { Toaster } from '@components/Toaster/Toaster'
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog'
import { ShortcutsDialog } from '@components/ShortcutsDialog/ShortcutsDialog'
import { SettingsDialog } from '@components/SettingsDialog/SettingsDialog'
import { InvoicesPage } from '@pages/InvoicesPage/InvoicesPage'
import { EditorPage } from '@pages/EditorPage/EditorPage'
import { ItemsPage } from '@pages/ItemsPage/ItemsPage'
import { ClientsPage } from '@pages/ClientsPage/ClientsPage'
import { CompanyPage } from '@pages/CompanyPage/CompanyPage'
import styles from './App.module.css'

export function App () {
  const ready = useBootstrap()
  const appTheme = usePrefsStore((s) => s.prefs.appTheme)
  const page = useUiStore((s) => s.page)

  useAppTheme(appTheme)
  useShortcuts()

  return (
    <div className={styles.app}>
      <TopRail />

      <main className={styles.main}>
        {!ready ? (
          <div className={styles.loading}>
            <p>Opening…</p>
          </div>
        ) : page === 'invoices' ? (
          <InvoicesPage />
        ) : page === 'editor' ? (
          <EditorPage />
        ) : page === 'items' ? (
          <ItemsPage />
        ) : page === 'clients' ? (
          <ClientsPage />
        ) : (
          <CompanyPage />
        )}
      </main>

      <ConfirmDialog />
      <ShortcutsDialog />
      <SettingsDialog />
      <Toaster />
    </div>
  )
}
