self.fflate = await anura.import("npm:fflate");
self.mime = await anura.import("npm:mime");
import { File } from "./components/File.mjs";
import { TopBar } from "./components/TopBar.mjs";
import { SideBar } from "./components/SideBar.mjs";
self.currentlySelected = [];
self.clipboard = [];
self.removeAfterPaste = false;
self.fs = anura.fs;
self.Buffer = Filer.Buffer;
self.sh = new anura.fs.Shell();
// Wrapped in a fragment because for some reason html`<style />` doesn't work
document.head.appendChild(
    html`<><style data-id="anura-theme">${anura.ui.theme.css()}</style></>`,
);

document.addEventListener("anura-theme-change", () => {
    document.head.querySelector('style[data-id="anura-theme"]').innerHTML =
        anura.ui.theme.css();
});

const url = new URL(window.location.href);
if (url.searchParams.get("picker")) {
    const picker = ExternalApp.deserializeArgs(url.searchParams.get("picker"));
    if (picker) {
        //document.getElementById("selector").style.display = "";
        filePicker = {};
        filePicker.regex = new RegExp(picker[0]);
        filePicker.type = picker[1];
    }
}

function App() {
    this.css = `
        background-color: var(--theme-bg);
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        .fileView {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
    `;

    return html`
        <div id="app">
            <${SideBar}></${SideBar}>
            <div class="fileView">
                <${TopBar}></${TopBar}>
                <hr>
                <table on:click=${() => {
                    currentlySelected.forEach((row) => {
                        row.classList.remove("selected");
                    });
                    currentlySelected = [];
                }}>
                    <thead>
                        <tr>
                            <th data-type="icon">
                                <span
                                    class="resize-handle hidden-resize-handle"
                                ></span>
                            </th>
                            <th data-type="name">
                                Name<span class="resize-handle"></span>
                            </th>
                            <th data-type="size">
                                Size<span class="resize-handle"></span>
                            </th>
                            <th data-type="type">
                                Type<span class="resize-handle"></span>
                            </th>
                            <th data-type="modified">
                                Date modified<span class="resize-handle"></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
            </div>
        </div>
    `;
}
async function loadPath(path) {
    console.debug("loading path: ", path);
    let files = await fs.promises.readdir(path + "/");
    files.sort();
    console.debug("files: ", files);
    setBreadcrumbs(path);
    let table = document.querySelector("tbody");
    table.innerHTML = "";
    let filesToLoad = files.length;
    files.forEach(async (file) => {
        const stats = await fs.promises.stat(`${path}/${file}`);
        if (stats.isDirectory()) {
        } else {
            if (self.filePicker) {
                if (self.filePicker.type !== "dir") {
                    let ext = file.split("/").pop().split(".").pop();
                    if (self.filePicker.regex.test(ext)) {
                        table.appendChild(
                            html`<${File} path=${path} file=${file} stats=${stats}></${File}>`,
                        );
                    }
                }
            } else {
                table.appendChild(
                    html`<${File} path=${path} file=${file} stats=${stats}></${File}>`,
                );
            }
        }
    });
}
document.body.appendChild(html`<${App} />`);
loadPath("/");
