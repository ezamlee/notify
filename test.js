console.log(this)

function get_this(){
	console.log(this);
}

get_this()

var get_this_1 = function(){
	console.log(this);
}
var get_this_2 = ()=>{
	console.log(this);
}
get_this_1();
get_this_2();

obj = {
	name:"ahmed",
	mth: function(){
		console.log('member method',this);
	},
	mth1:()=>{
		console.log('arrow member',this);
	},
	mth2:function(){
		var obj2 = {
			mth:function (argument) {
				 var x = function(){
				 	console.log('inner var',this);
				 };
				 console.log('inner console',this);
				 x();
			}
		}
		obj2.mth();
	}
}
obj.mth();
obj.mth1();
obj.mth2();
