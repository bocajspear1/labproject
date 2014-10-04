# LabProject

LabProject is my work in progress idea to create a virtualized lab enviroment with a web based interface.

##Planned Features:
* Virtualization of PCs, servers and entire networks using popular, modern virtualization technology
* Multiple VM hypervisor support (with libvirt [http://libvirt.org/])
* Support for multiple hypervisor servers
* Support for some Cisco equipment (using GNS3 [http://www.gns3.net/])

##Using:
* MongoDB [http://www.mongodb.org/]
* Libvirt [http://libvirt.org/]
* SocketStream [http://www.socketstream.org/]
* NodeJS Libvirt Bindings: [https://github.com/c4milo/node-libvirt]

##Development Setup

To set LabProject up for development:

1. Install Libvirt

> NOTE: I recommend building Libvirt from source. At least with apt-get, these are the dependencies: 

``` gcc make pkg-config libxml2-dev libgnutls-dev libdevmapper-dev libcurl4-gnutls-dev python-dev libpciaccess-dev libyajl2 libyajl-dev libnl-dev uuid-dev ```

2. Install Nodejs and MongoDB
3. run ``` npm install ``` in the root to install add the Nodejs dependencies
4. Install the NodeJS Libvirt bindings from here: https://github.com/c4milo/node-libvirt. The app's folder to link in is the main directory of LabProject
5. You're all setup!

## File Structure

*Based on the Socketstream folder structure*

* **lib** - LabProject libraries and main files
  * **controllers** - These scripts interface with the managers, putting together access controls, permissions and management functions. Most security functionality will go here, though it expects the user is authenticated and properly identified.
  * **managers** - These scripts are basically objects, security is limited to local necessities. Scripts manage creating and getting the objects, with some other base functions.
  * **util** - Other scripts that mainly help other scripts.
* **middleware** - Middleware for Socketstream
* **rpc** - Remote Procedure Calls for front-end Socketstream calls