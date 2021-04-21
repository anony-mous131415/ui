#!/bin/bash
#Run Command : bash build.rpm.sh or make it excecutable chmod +x file_name
#@author ashish
set -xv
export NODE_OPTIONS=--max_old_space_size=2048
PROD_DIR=atom/ui_release/atomexui
BETA_DIR=atom/ui_release/beta_atomexui
STAGE_DIR=atom/ui_release/stage_atomexui
VERSION=`date '+%Y_%m_%d_%H_%M_%S'`
BUILD_FAILED="Oops!!! Build Failed... Exiting... :("
which npm
dependencyStatus=$?
if [ $dependencyStatus == 1 ]
then
	echo "npm not installed in the system!!!"
	echo BUILD_FAILED
	exit 2
fi
which fpm
dependencyStatus=$?
if [ $dependencyStatus == 1 ]
then
	echo "fpm not installed in the system!!!"
	echo BUILD_FAILED
	exit 2
fi
rm -rf dist
rm -rf rpmBuild
# npm install && { echo "Dependencies installation failed!!!";echo $BUILD_FAILED;exit 2; }
npm install
npmInstallStatus=$?
echo 'npm install status '$npmInstallStatus
if [ $npmInstallStatus == 0 ]
then
	echo "npm install successfully done..."
else
	echo "npm install failed..."
	echo $BUILD_FAILED
	exit 2
fi
npm run build:beta
status=$?
echo 'status'$status
if [ $status == 0 ]
then
	echo "ng build successful for beta... :)"
  npm run optimizecss
  statusOpCss=$?
  echo 'status optimize css -> '$statusOpCss
  npm run cdn:beta
  statusCDN=$?
  echo 'status CDN Beta -> '$statusCDN
	mkdir -p rpmBuild/$BETA_DIR/release
	cp -r dist/* rpmBuild/$BETA_DIR/release/
else
   echo $BUILD_FAILED
   exit 2
fi
# deleting dist for building production rpm again
rm -rf dist
npm run build:stage
status=$?
echo 'status'$status
if [ $status == 0 ]
then
	echo "ng build successful for staging... :)"
  npm run optimizecss
	statusOpCss=$?
  echo 'status optimize css -> '$statusOpCss
	mkdir -p rpmBuild/$STAGE_DIR/release
	cp -r dist/* rpmBuild/$STAGE_DIR/release/
else
   echo $BUILD_FAILED
   exit 2
fi
# deleting dist for building production rpm again
rm -rf dist
npm run build:prod
status=$?
echo 'status'$status
if [ $status == 0 ]
then
	echo "ng build successful for production... :)"
  npm run optimizecss
	statusOpCss=$?
  echo 'status optimize css -> '$statusOpCss
  npm run cdn:prod
  statusCDN=$?
  echo 'status CDN Beta -> '$statusCDN
	mkdir -p rpmBuild/$PROD_DIR/release
	cp -r dist/* rpmBuild/$PROD_DIR/release/
	cd rpmBuild/
	fpm -s dir -t rpm -n atomexui -v $VERSION atom/
	fpmStatus=$?
	cd ..
	if [ $fpmStatus == 0 ]
	then
		echo "Yayyy!!! Build Successfully"
		echo "RPM inside rpmBuild folder ... :)"
	else
   		echo "Angular Project failed to create RPM!!!"
		exit 2
	fi
	# fpm -s dir -t rpm -n atomexui --rpm-user ashishkumar --rpm-group ashishkumar -v $VERSION atom/
else
   echo $BUILD_FAILED
fi
