#### Setting up Labproject ####

You will need: 

Virtualbox (Don't forget the additions) OR Qemu OR Xen
Open vSwitch
Nodejs
Libvirt NodeJS bindings

### Quick Installs ###

For Open vSwitch, Libvirt, Virtualbox and Qemu/KVM on an Ubuntu machine:

	sudo apt-get install libvirt-bin libvirt-dev virtualbox virtualbox-guest-additions-iso qemu-kvm libxml2-utils openvswitch-switch openvswitch-controller openvswitch-switch openvswitch-datapath-source

NOTE: You most likely will not get the latest and greatest of the packages, but this is quick and easy

--- NodeJS ---

For Ubuntu, without adding ppa's (You will most likely get an older version):

	sudo apt-get install nodejs

For Ubuntu, WITH adding ppa's (You will most likely get an older version):

	Run "install_latest_nodejs.sh" in this directory with sudo