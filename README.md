# DallasUrbanists.com website

This is the source code for the Dallas Urbanists website (previously known as This Dallas Life).

## Local development setup

You'll need to install:

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
1. [Visual Studio Code](https://code.visualstudio.com/Download)

Make sure Docker is running. Then, in VS Code, install the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

Clone this repo by running
```
git clone https://github.com/DallasUrbanists/dallasurbanists.com
```
and then open it in VS Code. 

Now that you have all the pieces, you'll bring it all together by opening the project in a Docker container.

 - Open the command palette (<kbd>Ctrl+Shift+P</kbd>) and start typing `Reopen in Container...`. 
 - Choose the command that matches that text (it may be prefixed with `Dev Containers` or `Remote-Containers`). 
    - VS Code will reopen and start creating a Docker container based on the configuration specified in [`.devcontainer/devcontainer.json`](https://github.com/DallasUrbanists/dallasurbanists.com/blob/main/.devcontainer/devcontainer.json). It may take a while, but once it finishes, you'll have everything needed to start developing!

## Making changes and viewing locally
You can start a local web server for the website by pressing <kbd>Ctrl+Shift+B</kbd>, which runs the build task defined in [.vscode/tasks.json](https://github.com/DallasUrbanists/dallasurbanists.com/blob/main/.vscode/tasks.json). 

In your browser, go to https://localhost:4000 to see the site. When you make a change to source code, the site will automatically refresh.

## Closing out of local development

You can stop the web server by focusing on the terminal in VS Code that's running the server, and pressing <kbd>Ctrl+C</kbd>.

To close out of the Docker container, you can just close out the VS Code window. To verify that the container is no longer running, you can check Docker Desktop.
