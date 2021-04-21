# Project Setup

##### This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.1.0.

## Installation

###### Install npm and node
- Used Node version: 12.4.0 | npm version: 6.9.0
- Use nvm to install the specific version of NODE

###### Install the latest Angular CLI
- Used Angular CLI version: 8.1.0 | Angular version: 8.1.0
- To update Angular CLI to a new version, you must update both the global package and your project's local package.

###### Global package:
`$ npm uninstall -g @angular/cli`

`$ npm cache verify`

###### if npm version is < 5 then use 
`$ npm cache clean` 

`$ npm install -g @angular/cli@latest`


## Creating new project
`$ ng new UiApp`
- The CLI creates a new workspace and a simple Welcome app, ready to run. For example, Allow routing - Yes

##### Development server
The Angular CLI includes a server, so that you can easily build and serve your app locally.
Go to your workspace, UiApp folder and run the below command. The `$ ng serve` command launches the server, watches your files, and rebuilds the app as you make changes to those files.

- The --open (or just -o) option automatically opens your browser to http://localhost:4200/.
`$ ng serve --open`
- If "ng serve" live development does not detect file changes
`$ ng serve --poll=2000` or `$ echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`

##### To build your project for production
To create an rpm of the project. Run `$ ./build.rpm.sh`
You need not to build your project. Just run the build.rpm.sh script. It will install the dependencies, build the app and wrap the build files in an rpm using fpm. The build artifacts will be stored in the `dist/` directory. And the rpm files will be stored inside the folder, `rpmBuild/`.

##### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

##### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).


##### To generate documentation

Run `$ npm run compodoc`

(To Install compodoc `$ sudo npm install -g @compodoc/compodoc`)


#### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


## Generate Api and Auth Client

###### Add user to your system
- npm login
- enter username and password

###### Publish AUTH client code to npm
- Go to client-generator folder
- sh publish_auth_client.sh HOST_NAME_WITH_PORT UPDATED_VERSION

###### Publish API client code to npm
- Go to client-generator folder
- sh publish_api_client.sh HOST_NAME_WITH_PORT UPDATED_VERSION

###### Example
- sh publish_api_client.sh https://apiv2beta.atomex.net 2.0.0
- sh publish_auth_client.sh https://urgv2beta.atomex.net 1.0.0
- If you are accessing api with specific port put the port as well. Like  http://10.150.1.5:10045
- For the latest version, you have to login to https://www.npmjs.com (Credential required)