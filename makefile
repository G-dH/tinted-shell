EXTENSION_UUID = tinted-shell@pakovm
INSTALL_PATH = ~/.local/share/gnome-shell/extensions/$(EXTENSION_UUID)
FILES = extension.js metadata.json stylesheet.css

install:
	rm -rf $(INSTALL_PATH)
	mkdir -p $(INSTALL_PATH)
	cp $(FILES) $(INSTALL_PATH)
	@echo "Installed 'Tinted Shell' to $(INSTALL_PATH)"
	@echo "Please restart GNOME Shell (logout/login) to apply changes."

zip:
	zip tinted-shell.zip $(FILES)

uninstall:
	rm -rf $(INSTALL_PATH)
