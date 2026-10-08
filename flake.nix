{
  description = "ebur128_wasm development flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    nixpkgs,
    rust-overlay,
    ...
  }: let
    system = "x86_64-linux";
    pkgs = import nixpkgs {
      inherit system;
      overlays = [rust-overlay.overlays.default];
    };
    rust = pkgs.rust-bin.stable.latest.default.override {
      targets = ["wasm32-unknown-unknown"];
    };
  in {
    devShells.${system}.default = pkgs.mkShell {
      packages = [
        rust
        pkgs.wasm-pack
        # wasm-pack uses this only if its version equals the wasm-bindgen
        # resolved in ebur128-crate/Cargo.lock, otherwise it downloads its own.
        pkgs.wasm-bindgen-cli
        pkgs.nodejs_latest
      ];

      shellHook = ''
        cargo --version
        wasm-pack --version
        wasm-bindgen --version
        node --version
      '';
    };
  };
}
