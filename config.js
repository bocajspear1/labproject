
module.exports = {
	database_connection_string:'mongodb://localhost:27017/labproject',
	head_port:'1234',
	server_port: '3000',
	hypervisors: [
		{name: 'KVM/QEMU',libvirtstring: 'qemu', capabilities:{os: ['windows','linux'],remote:['vnc']},enabled:true},
		{name: 'VirtualBox',libvirtstring: 'vbox', capabilities:{os: ['windows','linux'],remote:['rdp']},enabled:true},
		{name: 'Xen',libvirtstring: 'xen', capabilities:{os: ['windows','linux'],remote:['vnc']},enabled:false}
	],
	// The path where the libvirt pool is. Do not make relative path. Do not put a slash on the end
	pool_path: '/home/jacob/labproject-pool',
	// The path where the ISO storage is. Do not make relative path. Do not put a slash on the end
	iso_path: '/home/jacob/labproject-isos',
	// The path where snapsho Do not make will be stored. Do not make relative path. Do not put a slash on the end
	snapshot_path: '/home/jacob/labproject-snapshots',
	// Overrides the location of the libvirt binaries
	libvirt_path: "/libvirt/sbin/"
};
