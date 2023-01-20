import { ElementProps, UITool } from "../tools/ui";

/**
 * Dialog window helper. A superset of XUL dialog.
 */
export class DialogHelper {
  /**
   * Passed to dialog window for data-binding and lifecycle controll. See {@link DialogHelper.setDialogData}
   */
  dialogData: DialogData;
  /**
   * Dialog window instance
   */
  window!: Window;
  private elementProps: ElementProps;
  /**
   * Create a dialog helper with row \* column grids.
   * @param row
   * @param column
   */
  constructor(row: number, column: number) {
    if (row <= 0 || column <= 0) {
      throw Error(`row and column must be positive integers.`);
    }
    this.elementProps = {
      tag: "vbox",
      attributes: { flex: 1 },
      styles: {
        width: "100%",
        height: "100%",
      },
      children: [],
    };
    for (let i = 0; i < Math.max(row, 1); i++) {
      this.elementProps.children!.push({
        tag: "hbox",
        attributes: { flex: 1 },
        children: [],
      });
      for (let j = 0; j < Math.max(column, 1); j++) {
        this.elementProps.children![i].children!.push({
          tag: "vbox",
          attributes: { flex: 1 },
          children: [],
        });
      }
    }
    this.elementProps.children!.push({
      tag: "hbox",
      attributes: { flex: 0, pack: "end" },
      children: [],
    });
    this.dialogData = {};
  }

  /**
   * Add a cell at (row, column). Index starts from 0.
   * @param row
   * @param column
   * @param elementProps Cell element props. See {@link ElementProps}
   * @param cellFlex If the cell is flex. Default true.
   */
  addCell(
    row: number,
    column: number,
    elementProps: any,
    cellFlex: boolean = true
  ) {
    if (
      row >= this.elementProps.children!.length ||
      column >= this.elementProps.children![row].children!.length
    ) {
      throw Error(
        `Cell index (${row}, ${column}) is invalid, maximum (${
          this.elementProps.children!.length
        }, ${this.elementProps.children![0].children!.length})`
      );
    }
    this.elementProps.children![row].children![column].children = [
      elementProps,
    ];
    this.elementProps.children![row].children![column].attributes!.flex =
      cellFlex ? 1 : 0;
    return this;
  }

  /**
   * Add a control button to the bottom of the dialog.
   * @param label Button label
   * @param id Button id.
   * The corresponding id of the last button user clicks before window exit will be set to `dialogData._lastButtonId`.
   * @param options.noClose Don't close window when clicking this button.
   * @param options.callback Callback of button click event.
   */
  addButton(
    label: string,
    id?: string,
    options: {
      noClose?: boolean;
      callback?: (ev: Event) => any;
    } = {}
  ) {
    id = id || `${Zotero.Utilities.randomString()}-${new Date().getTime()}`;
    this.elementProps.children![
      this.elementProps.children!.length - 1
    ].children!.push({
      tag: "vbox",
      styles: {
        margin: "10px",
      },
      children: [
        {
          tag: "button",
          namespace: "html",
          id,
          attributes: {
            type: "button",
          },
          listeners: [
            {
              type: "click",
              listener: (e: Event) => {
                this.dialogData._lastButtonId = id;
                if (options.callback) {
                  options.callback(e);
                }
                if (!options.noClose) {
                  this.window.close();
                }
              },
            },
          ],
          children: [
            {
              tag: "div",
              styles: {
                padding: "2.5px 15px",
              },
              properties: {
                innerHTML: label,
              },
            },
          ],
        },
      ],
    });
    return this;
  }

  /**
   * Dialog data.
   * @remarks
   * This object is passed to the dialog window.
   *
   * The control button id is in `dialogData._lastButtonId`;
   *
   * The data-binding values are in `dialogData`.
   * ```ts
   * interface DialogData {
   *   [key: string | number | symbol]: any;
   *   loadLock?: _ZoteroTypes.PromiseObject; // resolve after window load (auto-generated)
   *   loadCallback?: Function; // called after window load
   *   unloadLock?: _ZoteroTypes.PromiseObject; // resolve after window unload (auto-generated)
   *   unloadCallback?: Function; // called after window unload
   *   beforeUnloadCallback?: Function; // called before window unload when elements are accessable.
   * }
   * ```
   * @param dialogData
   */
  setDialogData(dialogData: DialogData) {
    this.dialogData = dialogData;
    return this;
  }

  /**
   * Open the dialog
   * @param title Window title
   * @param windowFeatures.width Ignored if fitContent is `true`.
   * @param windowFeatures.height Ignored if fitContent is `true`.
   * @param windowFeatures.left
   * @param windowFeatures.top
   * @param windowFeatures.centerscreen Open window at the center of screen.
   * @param windowFeatures.resizable If window is resizable.
   * @param windowFeatures.fitContent Resize the window to content size after elements are loaded.
   * @param windowFeatures.noDialogMode Dialog mode window only has a close button. Set `true` to make maximize and minimize button visible.
   */
  open(
    title: string,
    windowFeatures: {
      width?: number;
      height?: number;
      left?: number;
      top?: number;
      centerscreen?: boolean;
      resizable?: boolean;
      fitContent?: boolean;
      noDialogMode?: boolean;
    } = {
      centerscreen: true,
      resizable: true,
      fitContent: true,
    }
  ) {
    this.window = openDialog(
      `${Zotero.Utilities.randomString()}-${new Date().getTime()}`,
      title,
      this.elementProps,
      this.dialogData,
      windowFeatures
    );
    return this;
  }
}

function openDialog(
  targetId: string,
  title: string,
  elementProps: any,
  dialogData?: DialogData,
  windowFeatures: {
    width?: number;
    height?: number;
    left?: number;
    top?: number;
    centerscreen?: boolean;
    resizable?: boolean;
    fitContent?: boolean;
    noDialogMode?: boolean;
  } = {
    centerscreen: true,
    resizable: true,
    fitContent: true,
  }
) {
  const uiTool = new UITool();
  uiTool.basicOptions.ui.enableElementJSONLog = false;
  uiTool.basicOptions.ui.enableElementRecord = false;
  const Zotero = uiTool.getGlobal("Zotero");
  dialogData = dialogData || {};

  // Make winowfeature string
  if (!dialogData.loadLock) {
    dialogData.loadLock = Zotero.Promise.defer();
  }
  if (!dialogData.unloadLock) {
    dialogData.unloadLock = Zotero.Promise.defer();
  }
  let featureString = `resizable=${windowFeatures.resizable ? "yes" : "no"},`;
  if (windowFeatures.width || windowFeatures.height) {
    featureString += `width=${windowFeatures.width || 100},height=${
      windowFeatures.height || 100
    },`;
  }
  if (windowFeatures.left) {
    featureString += `left=${windowFeatures.left},`;
  }
  if (windowFeatures.top) {
    featureString += `left=${windowFeatures.top},`;
  }
  if (windowFeatures.centerscreen) {
    featureString += "centerscreen,";
  }
  if (windowFeatures.noDialogMode) {
    featureString += "dialog=no,";
  }

  // Create window
  const win: Window = uiTool.getGlobal("openDialog")(
    "about:blank",
    targetId || "_blank",
    featureString,
    dialogData
  );

  // After load
  dialogData.loadLock.promise
    .then(() => {
      // Set title
      win.document.head.appendChild(
        uiTool.createElement(win.document, "title", {
          properties: { innerText: title },
        })
      );
      // Add style according to Zotero prefs
      win.document.head.appendChild(
        uiTool.createElement(win.document, "style", {
          properties: {
            innerText: `html,body{ font-size: calc(12px * ${Zotero.Prefs.get(
              "fontSize"
            )}) }`,
          },
        })
      );
      // Create element
      win.document.body.appendChild(
        uiTool.createElement(win.document, "fragment", {
          children: [elementProps],
        })
      );
      // Load data-binding
      Array.from(win.document.querySelectorAll("*[data-bind]")).forEach(
        (elem: Element) => {
          const bindKey = elem.getAttribute("data-bind");
          const bindAttr = elem.getAttribute("data-attr");
          const bindProp = elem.getAttribute("data-prop");
          if (bindKey && dialogData && dialogData[bindKey]) {
            if (bindProp) {
              (elem as any)[bindProp] = dialogData[bindKey];
            } else {
              elem.setAttribute(bindAttr || "value", dialogData[bindKey]);
            }
          }
        }
      );
      // Resize window
      if (windowFeatures.fitContent) {
        (win as any).sizeToContent();
      }
      win.focus();
    })
    .then(() => {
      // Custom load callback
      dialogData?.loadCallback && dialogData.loadCallback();
    });
  dialogData.unloadLock.promise.then(() => {
    // Custom unload callback
    dialogData?.unloadCallback && dialogData.unloadCallback();
  });

  // Wati for window loading to resolve the lock promise
  win.addEventListener(
    "DOMContentLoaded",
    function onWindowLoad(ev: Event) {
      (win as any).arguments[0]?.loadLock?.resolve();
      win.removeEventListener("DOMContentLoaded", onWindowLoad, false);
    },
    false
  );

  // Wait for window unload. Use beforeunload to access elements.
  win.addEventListener("beforeunload", function onWindowBeforeUnload(ev) {
    // Update data-binding
    Array.from(win.document.querySelectorAll("*[data-bind]")).forEach(
      (elem: Element) => {
        const dialogData = (this.window as any).arguments[0];
        const bindKey = elem.getAttribute("data-bind");
        const bindAttr = elem.getAttribute("data-attr");
        const bindProp = elem.getAttribute("data-prop");
        if (bindKey && dialogData) {
          if (bindProp) {
            dialogData[bindKey] = (elem as any)[bindProp];
          } else {
            dialogData[bindKey] = elem.getAttribute(bindAttr || "value");
          }
        }
      }
    );
    this.window.removeEventListener(
      "beforeunload",
      onWindowBeforeUnload,
      false
    );
    dialogData?.beforeUnloadCallback && dialogData.beforeUnloadCallback();
  });

  // Wait for window unload to resolve the lock promise
  win.addEventListener("unload", function onWindowUnload(ev) {
    if ((this.window as any).arguments[0]?.loadLock.promise.isPending()) {
      return;
    }
    (this.window as any).arguments[0]?.unloadLock?.resolve();
    this.window.removeEventListener("unload", onWindowUnload, false);
  });
  if (win.document.readyState === "complete") {
    (win as any).arguments[0]?.loadLock?.resolve();
  }
  return win;
}

interface DialogData {
  [key: string | number | symbol]: any;
  loadLock?: _ZoteroTypes.PromiseObject;
  loadCallback?: Function;
  unloadLock?: _ZoteroTypes.PromiseObject;
  unloadCallback?: Function;
  beforeUnloadCallback?: Function;
}