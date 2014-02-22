var pattern = /[^a-zA-Z0-9_()\[\] \\-]/g

var name1 = "Tester1 is a great thing (Funny) [String] !@#$^&*`~"
name1 = name1.replace(pattern,"");
console.log(name1);

var name2 = "tester_123(1)"
name2 = name2.replace(pattern,"");
console.log(name2);

var name3 = "tester-123(1)<<"
name3 = name3.replace(pattern,"");
console.log(name3);

