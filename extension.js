import Gio from 'gi://Gio';
import St from 'gi://St';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// Hex codes extracted from your gnome-shell.css file
const ACCENT_COLORS = {
    'blue':   '#3584e4',
    'teal':   '#2190a4',
    'green':  '#3a944a',
    'yellow': '#c88800',
    'orange': '#ed5b00',
    'red':    '#e62d42',
    'pink':   '#d56199',
    'purple': '#9141ac',
    'slate':  '#6f8396'
};

const COLOR_NAMES = Object.keys(ACCENT_COLORS);

export default class DynamicAccentExtension extends Extension {
    enable() {
        this._settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
        
        // 1. Load your provided theme file
        let themeContext = St.ThemeContext.get_for_stage(global.stage);
        this._theme = themeContext.get_theme();
        
        // We expect gnome-shell.css to be in the extension folder
        this._cssFile = this.dir.get_child('gnome-shell.css');
        
        if (this._cssFile.query_exists(null)) {
            this._theme.load_stylesheet(this._cssFile);
        } else {
            console.warn('[DynamicAccent] gnome-shell.css not found in extension directory');
        }

        // 2. Watch for changes
        this._settingsId = this._settings.connect('changed::accent-color', () => {
            this._updateAccent();
        });

        // 3. Initial Apply
        this._updateAccent();
    }

    disable() {
        // Unload stylesheet
        if (this._theme && this._cssFile) {
            this._theme.unload_stylesheet(this._cssFile);
        }
        
        // Clean up styles
        this._removeStyles();
        
        // Disconnect settings
        if (this._settings) {
            this._settings.disconnect(this._settingsId);
            this._settings = null;
        }
    }

    _updateAccent() {
        // Clean old classes first
        this._removeStyles();

        let colorName = this._settings.get_string('accent-color');
        
        // Fallback to blue if something goes wrong
        if (!ACCENT_COLORS[colorName]) colorName = 'blue';

        let hexColor = ACCENT_COLORS[colorName];
        let className = `accent-${colorName}`;

        // Apply to Main.uiGroup (The root of the GNOME Shell UI)
        // 1. Add the Class (triggers your .accent-blue #panel selectors)
        Main.uiGroup.add_style_class_name(className);
        
        // 2. Add the Variable (triggers generic items like .check-box using -st-accent-color)
        // We set generic fg-color to white as standard for dark shell themes
        let styleString = `
            -st-accent-color: ${hexColor};
            -st-accent-fg-color: #ffffff;
        `;
        Main.uiGroup.set_style(styleString);

        // Also apply to modalDialogGroup so dialogs get the styling
        Main.layoutManager.modalDialogGroup.add_style_class_name(className);
        Main.layoutManager.modalDialogGroup.set_style(styleString);
    }
    
    _removeStyles() {
        // Remove style definitions
        Main.uiGroup.set_style(null);
        Main.layoutManager.modalDialogGroup.set_style(null);

        // Remove all possible accent classes
        COLOR_NAMES.forEach(name => {
            let className = `accent-${name}`;
            Main.uiGroup.remove_style_class_name(className);
            Main.layoutManager.modalDialogGroup.remove_style_class_name(className);
        });
    }
}
