{ pkgs }: {
	deps = [
		pkgs.nodejs-16_x
    pkgs.mmh
		pkgs.nodePackages.typescript-language-server
		pkgs.yarn
		pkgs.replitPackages.jest
	];
}