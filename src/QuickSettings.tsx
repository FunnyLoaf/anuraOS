class QuickSettings {
    dateformat = new Intl.DateTimeFormat(navigator.language, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    state: Stateful<{
        showQuickSettings?: boolean;
        pinnedSettings: Array<{
            registry: string;
            icon?: string;
            type: string;
            name: string;
            description: string;
            value: any;
        }>;
        date: string;
    }> = stateful({
        showQuickSettings: false,
        pinnedSettings: [],
        date: new Date().toLocaleString(),
    });

    subscribed = false;

    transition = css`
        transition: opacity 0.15s cubic-bezier(0.445, 0.05, 0.55, 0.95);
    `;

    show = css`
        opacity: 1;
        z-index: 9998;
    `;

    hide = css`
        opacity: 0;
        z-index: -1;
    `;

    panelCss = css`
        position: absolute;
        background-color: rgba(22, 22, 22, 0.9);
        border: 1px solid rgba(0, 0, 0, 1);
        box-shadow: inset 0 0 0 1px #3e3e3e;
        border-radius: 1em;
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
        display: flex;
        flex-grow: 1;
        flex-direction: column;
    `;

    quickSettingsCss = css`
        max-height: 40vh;
        width: 360px;
        height: 40%;
        bottom: 60px;
        right: 10px;

        .quickSettingsContent {
            display: flex;
            flex-direction: column;
            gap: 1em;
            padding: 1em;
            height: 100%;
            overflow-y: scroll;

            &::-webkit-scrollbar {
                display: none;
            }

            .topButtons {
                display: flex;
                flex-direction: row;
                gap: 1em;

                .symbolButton {
                    border-radius: 28px;
                    background-color: #3c4043;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 28px;
                    height: 28px;
                    min-height: 0;
                    min-width: 0;
                    padding: 0;

                    span {
                        font-size: 18px;
                    }
                }
            }

            .quickSettingsPinned {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: 1fr 1fr;

                .pinnedSetting {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1em;
                    padding: 0.5em;

                    .settingsIcon {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 34px;
                        height: 34px;
                        min-height: 0;
                        min-width: 0;
                        border-radius: 50%;
                        background-color: #3c4043;

                        span {
                            color: #e8eaed;
                            font-size: 24px;
                        }

                        &.enabled {
                            background-color: #8ab4f8;

                            span {
                                color: #3c4043;
                            }
                        }
                    }

                    .settingTitle {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 12px;
                        color: #e8eaed;
                        text-align: center;
                    }
                }
            }
            .sliderContainer {
                display: flex;
                flex-direction: row;
                gap: 1em;
                align-items: center;
                flex-grow: 1;
                /* Currently empty */
            }
            .dateContainer {
                height: 1em;
                display: flex;
                flex-direction: row;

                span {
                    color: #e8eaed;
                    font-size: 12px;
                }
            }
        }
    `;

    quickSettingsElement = (
        <div
            class={[
                this.panelCss,
                this.transition,
                use(this.state.showQuickSettings, (open) =>
                    open ? this.show : this.hide,
                ),
                this.quickSettingsCss,
            ]}
            id="quickSettings"
        >
            <div class={["quickSettingsContent"]}>
                <div class={["topButtons"]}>
                    <button
                        class={["matter-button-contained", "symbolButton"]}
                        title="Exit anuraOS"
                        on:click={() => {
                            window.location.replace(
                                anura.settings.get("exitUrl") ||
                                    "https://google.com/",
                            );
                        }}
                    >
                        <span class="material-symbols-outlined">
                            power_settings_new
                        </span>
                    </button>
                    <button
                        class={["matter-button-contained", "symbolButton"]}
                        on:click={() => {
                            anura.apps["anura.settings"].open();
                            this.close();
                        }}
                    >
                        <span class={["material-symbols-outlined"]}>
                            settings
                        </span>
                    </button>
                </div>
                <div class={["quickSettingsPinned"]}>
                    {use(this.state.pinnedSettings, (pinnedSettings) =>
                        pinnedSettings
                            .filter((setting) => setting.type === "boolean")
                            .map((setting) => (
                                <div
                                    class="pinnedSetting"
                                    title={setting.description}
                                    on:click={() => {
                                        setting.value = !setting.value;
                                        this.state.pinnedSettings =
                                            pinnedSettings;
                                        console.log(setting);
                                    }}
                                >
                                    <button
                                        class={[
                                            "matter-button-contained",
                                            "settingsIcon",
                                            setting.value && "enabled",
                                        ]}
                                    >
                                        <span class="material-symbols-outlined">
                                            {setting.icon || "settings"}
                                        </span>
                                    </button>
                                    <div class="settingTitle">
                                        <span>{setting.name}</span>
                                    </div>
                                </div>
                            )),
                    )}
                </div>
                <div class={["sliderContainer"]}></div>
                <div class={["dateContainer"]}>
                    <span>{use(this.state.date)}</span>
                </div>
            </div>
        </div>
    );

    notificationCenterCss = css`
        max-height: calc(60% - 80px);
        min-height: 20px;
        width: 360px;
        bottom: calc(70px + 40%);
        right: 10px;
        overflow: hidden;

        .notificationContainer {
            display: flex;
            gap: 2px;
            padding: 6px;
            flex-direction: column-reverse;
            overflow-y: scroll;

            &::-webkit-scrollbar {
                display: none;
            }

            .notification {
                border-radius: 0;

                /*
                    Flipped because of flex-direction: column-reverse
                */

                &:first-child {
                    border-bottom-left-radius: 1em;
                    border-bottom-right-radius: 1em;
                }

                &:last-child {
                    border-top-left-radius: 1em;
                    border-top-right-radius: 1em;
                }
            }
        }

        .clearButtonContainer {
            display: flex;
            justify-content: end;

            .clearButton {
                margin: 6px;
                margin-top: 0;
            }
        }
    `;

    notificationCenterElement = (
        <div
            class={[
                this.panelCss,
                this.transition,
                use(this.state.showQuickSettings, (open) =>
                    open ? this.show : this.hide,
                ),
                this.notificationCenterCss,
            ]}
            id="notificationCenter"
        ></div>
    );

    clickoffChecker: HTMLDivElement;
    updateClickoffChecker: (show: boolean) => void;

    open() {
        this.state.showQuickSettings = true;
    }

    close() {
        this.state.showQuickSettings = false;
    }

    toggle() {
        if (this.state.showQuickSettings) {
            this.close();
        } else {
            this.open();
        }
    }

    constructor(
        clickoffChecker: HTMLDivElement,
        updateClickoffChecker: (show: boolean) => void,
    ) {
        clickoffChecker.addEventListener("click", () => {
            this.state.showQuickSettings = false;
        });

        setInterval(() => {
            this.state.date = this.dateformat.format(new Date());
        }, 1000);

        this.clickoffChecker = clickoffChecker;
        this.updateClickoffChecker = updateClickoffChecker;

        handle(use(this.state.showQuickSettings), (show: boolean) => {
            // Update clickoff checker
            this.updateClickoffChecker(show);
            if ("anura" in window) {
                // Take over as renderer for notifications
                anura.notifications.setRender(!show);
                // Subscribe to notifications
                if (!this.subscribed) {
                    (this.state.pinnedSettings = anura.settings.get(
                        "pinnedSettings",
                    ) || [
                        {
                            registry: "disable-animation",
                            type: "boolean",
                            name: "Accessibility",
                            icon: "accessibility_new",
                            description: "Reduced motion",
                            value: false,
                        },
                        {
                            registry: "launcher-keybind",
                            type: "boolean",
                            name: "Launcher Keybind",
                            icon: "keyboard_command_key",
                            description: "Enable the launcher keybind",
                            value: true,
                        },
                    ]),
                        handle(
                            use(
                                anura.notifications.state.notifications,
                                (notifications) => notifications.length > 0,
                            ),
                            (show) => {
                                this.notificationCenterElement.style.display =
                                    show ? "flex" : "none";
                            },
                        );
                    handle(use(this.state.pinnedSettings), (pinnedSettings) => {
                        anura.settings.set("pinnedSettings", pinnedSettings);
                        pinnedSettings.forEach((setting) => {
                            anura.settings.set(setting.registry, setting.value);
                        });
                    });
                    this.notificationCenterElement.appendChild(
                        <div class={["notificationContainer"]}>
                            {use(
                                anura.notifications.state.notifications,
                                (notifications) =>
                                    notifications.map((notif) => {
                                        const notification =
                                            new QuickSettingsNotification(
                                                notif,
                                            );
                                        return notification.element;
                                    }),
                            )}
                        </div>,
                    );
                    this.notificationCenterElement.appendChild(
                        <div class={["clearButtonContainer"]}>
                            <button
                                class={["matter-button-text", "clearButton"]}
                                on:click={() => {
                                    anura.notifications.state.notifications.forEach(
                                        (n) => {
                                            n.close();
                                        },
                                    );
                                    anura.notifications.state.notifications =
                                        [];
                                }}
                            >
                                Clear all
                            </button>
                        </div>,
                    );
                    this.subscribed = true;
                }
            }
        });
    }
}

class QuickSettingsNotification {
    state: Stateful<{
        title: string;
        description: string;
        timeout: number | "never" | undefined;
        closeIndicator?: boolean | undefined;
        buttons: Array<{
            text: string;
            style?: "contained" | "outlined" | "text";
            callback: (notif: AnuraNotification) => void;
            close?: boolean;
        }>;
    }> = stateful({
        title: "",
        description: "",
        timeout: 2000,
        closeIndicator: false,
        buttons: [],
    });

    css = css`
        background-color: rgba(128, 128, 128, 0.2);
        border-radius: 1em;
        color: white;
        cursor: pointer;
        transition: all 0.15s cubic-bezier(0.445, 0.05, 0.55, 0.95);
        opacity: 1;

        &:hover .nbody .ntitle-container .close-indicator {
            opacity: 1;
        }

        .nbody {
            display: flex;
            flex-direction: column;
            padding: 1em;
            gap: 0.5em;

            .ntitle-container {
                display: flex;
                flex-direction: row;

                .ntitle {
                    color: #e8eaed;
                    font-size: 14px;
                    font-weight: 700;
                    flex-grow: 1;
                }

                .close-indicator {
                    width: 16px;
                    height: 16px;
                    opacity: 0;

                    span {
                        font-size: 16px;
                    }
                }
            }

            .ndesc {
                font-size: 12px;
                color: #bdc1c6;
            }

            .nbutton-container {
                display: flex;
                gap: 6px;

                .nbutton {
                    flex-grow: 1;
                }
            }
        }
    `;

    originalNotification: AnuraNotification;

    constructor(notif: AnuraNotification) {
        this.state.title = notif.title || "Anura Notification";
        this.state.description = notif.description || "Missing Description";
        this.state.timeout = notif.timeout || 2000;
        this.state.closeIndicator = notif.closeIndicator || false;
        this.state.buttons = notif.buttons || [];
        this.originalNotification = notif;
    }

    element = (
        <div class={[this.css, "notification"]}>
            <div
                class="nbody"
                on:click={(e: PointerEvent) => {
                    if (
                        e.target instanceof HTMLElement &&
                        e.target.tagName.toLowerCase() === "button"
                    ) {
                        return;
                    }
                    this.originalNotification.callback(
                        this.originalNotification,
                    );
                    this.close();
                }}
            >
                <div class="ntitle-container">
                    <div class="ntitle">{use(this.state.title)}</div>
                    <div
                        class="close-indicator"
                        on:click={(e: PointerEvent) => {
                            e.stopPropagation();
                            this.close();
                        }}
                    >
                        <span class="material-symbols-outlined">close</span>
                    </div>
                </div>
                <div class="ndesc">{use(this.state.description)}</div>
                {$if(
                    use(this.state.buttons, (buttons) => buttons.length > 0),
                    <div class={["nbutton-container"]}>
                        {use(this.state.buttons, (buttons) =>
                            buttons.map((button) => (
                                <button
                                    class={[
                                        button.style == "contained"
                                            ? "matter-button-contained"
                                            : button.style == "outlined"
                                              ? "matter-button-outlined"
                                              : "matter-button-text",
                                        "nbutton",
                                    ]}
                                    on:click={() => {
                                        button.callback(
                                            this.originalNotification,
                                        );
                                        if (
                                            typeof button.close ===
                                                "undefined" ||
                                            button.close
                                        )
                                            this.close();
                                    }}
                                >
                                    {button.text}
                                </button>
                            )),
                        )}
                    </div>,
                )}
            </div>
        </div>
    );

    close() {
        this.element.remove();
        anura.notifications.remove(this.originalNotification);
    }
}