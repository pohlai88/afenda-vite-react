import { toast } from "sonner"

/**
 * Copy text (or a promised string) to the clipboard. Safari requires the
 * ClipboardItem + deferred blob pattern for async content — see inline comments.
 *
 * If you change this, verify in Safari with a `Promise<string>` (e.g. expiring URL).
 *
 * Based on: https://wolfgangrittner.dev/how-to-use-clipboard-api-in-firefox/
 */
export const copyToClipboard = async (
  str: string | Promise<string>,
  callback: () => void = () => {},
): Promise<void> => {
  const focused = window.document.hasFocus()
  if (focused) {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const text = new ClipboardItem({
        "text/plain": Promise.resolve(str).then(
          (t) => new Blob([t], { type: "text/plain" }),
        ),
      })

      let resolve = () => {}
      let reject = () => {}
      const promise = new Promise<void>((res, rej) => {
        resolve = res
        reject = rej
      })

      setTimeout(() => {
        navigator.clipboard
          .write([text])
          .then(callback)
          .then(resolve)
          .catch(reject)
      }, 0)

      return promise
    }

    return Promise.resolve(str)
      .then((text) => navigator.clipboard?.writeText(text))
      .then(callback)
  }

  toast.error("Unable to copy to clipboard")
}
