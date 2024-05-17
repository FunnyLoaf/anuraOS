function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
export function File() {
    this.mount = async () => {
        this.icon = anura.files.fallbackIcon;
        try {
            const iconURL = await anura.files.getIcon(
                `${this.path}/${this.file}`,
            );
            this.icon = iconURL;
        } catch (e) {
            this.icon = anura.files.fallbackIcon;
            console.error(e);
        }
        this.description = "Anura File";
        try {
            const fileType = await anura.files.getFileType(
                `${this.path}/${this.file}`,
            );
            this.description = fileType;
        } catch (e) {
            this.description = "Anura File";
            console.error(e);
        }
    };
    return html`
        <tr
            on:mouseenter=${(e) => {
                e.currentTarget.classList.add("hover");
            }}
            on:mouseleave=${(e) => {
                e.currentTarget.classList.add("hover");
            }}
            on:contextmenu=${(e) => {
                if (currentlySelected.length > 0) {
                    return;
                }
                e.currentTarget.classList.add("selected");
                currentlySelected = [e.currentTarget];
            }}
            on:click=${(e) => {
                if (currentlySelected.includes(e.currentTarget)) {
                    if (
                        self.filePicker &&
                        self.filePicker.type == "file" &&
                        e.currentTarget.getAttribute("data-type") == "file"
                    )
                        selectAction(currentlySelected);
                    else fileAction(currentlySelected);
                    currentlySelected.forEach((row) => {
                        row.classList.remove("selected");
                    });
                    currentlySelected = [];
                    return;
                }
                if (!e.shiftKey) {
                    if (!e.ctrlKey) {
                        currentlySelected.forEach((row) => {
                            row.classList.remove("selected");
                        });
                        currentlySelected = [];
                    }
                    e.currentTarget.classList.add("selected");
                    currentlySelected.push(e.currentTarget);
                } else {
                    if (currentlySelected.length == 0) {
                        e.currentTarget.classList.add("selected");
                        currentlySelected.push(e.currentTarget);
                    } else {
                        var arr = Array.from(
                            document.querySelectorAll("tr"),
                        ).filter(
                            (row) =>
                                row.parentNode.nodeName.toLowerCase() !==
                                "thead",
                        );
                        var firstI = arr.indexOf(
                            currentlySelected[currentlySelected.length - 1],
                        );
                        var lastI = arr.indexOf(e.currentTarget);
                        var first = Math.min(firstI, lastI);
                        var last = Math.max(firstI, lastI);
                        for (var i = first; i <= last; i++) {
                            if (!currentlySelected.includes(arr[i])) {
                                currentlySelected.push(arr[i]);
                                arr[i].classList.add("selected");
                            }
                        }
                    }
                }
            }}
            data-type="file"
            data-path="${this.path}/${this.file}"
            ;
        >
            <td id="icon"></td>
            <td id="name">${this.file}</td>
            <td id="size">${formatBytes(this.stats.size)}</td>
            <td id="description">${this.description}</td>
        </tr>
    `;
}
