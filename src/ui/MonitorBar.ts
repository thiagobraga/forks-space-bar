import Clutter from 'gi://Clutter';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

type Alignment = 'left' | 'center' | 'right';

const ALIGNMENTS = {
    left: Clutter.ActorAlign.START,
    center: Clutter.ActorAlign.CENTER,
    right: Clutter.ActorAlign.END,
};

/**
 * A bar along the top edge of a monitor that doesn't have a top panel.
 *
 * GNOME Shell only shows its top panel on the primary monitor. This bar styled like the panel
 * allows Space Bar to show its indicator on other monitors as well. It reserves space for itself
 * like the panel does and hides when a window is fullscreen on its monitor.
 */
export class MonitorBar {
    readonly actor: St.BoxLayout;
    private readonly _menuManager: any;
    private readonly _menus: any[] = [];
    private readonly _alignment: Clutter.ActorAlign;

    constructor(monitorIndex: number, alignment: Alignment) {
        const monitor = Main.layoutManager.monitors[monitorIndex];
        this.actor = new St.BoxLayout({
            // Reuse the panel's theming.
            name: 'panel',
            styleClass: 'space-bar-monitor-bar',
            reactive: true,
            xAlign: Clutter.ActorAlign.FILL,
        });
        this.actor.set_position(monitor.x, monitor.y);
        this.actor.set_width(monitor.width);
        this._menuManager = new PopupMenu.PopupMenuManager(this.actor);
        this._alignment = ALIGNMENTS[alignment];
        Main.layoutManager.addChrome(this.actor, {
            affectsStruts: true,
            trackFullscreen: true,
        });
    }

    addButton(button: any): void {
        button.set_x_expand(true);
        button.set_x_align(this._alignment);
        this.actor.add_child(button);
        if (button.menu) {
            this._menuManager.addMenu(button.menu);
            this._menus.push(button.menu);
        }
    }

    destroy(): void {
        for (const menu of this._menus) {
            this._menuManager.removeMenu(menu);
        }
        this._menus.length = 0;
        Main.layoutManager.removeChrome(this.actor);
        this.actor.destroy();
    }
}
