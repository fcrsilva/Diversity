package server;

import java.util.HashMap;

public class Operations {
	private HashMap<String,Integer> op;
	
	
	public Operations(){
		op = new HashMap<String,Integer>();
		op.put("chartrequest", 1);
		op.put("load", 2);
		op.put("globalsentiment", 3);
		op.put("getposts", 4);
		op.put("getmodels",5);
		op.put("getcomments", 6);
		op.put("clean", 7);
		op.put("getauthors", 8);
		op.put("getlastpost", 9);
		op.put("getinfgraph", 10);
		op.put("getpopulation", 11);
		op.put("getconfig", 12);
		op.put("setconfig", 13);
		op.put("create_model", 14);
		op.put("get_model", 15);
		op.put("update_model",16);
		op.put("getpss", 17);
		op.put("opinion_extraction", 18);
		op.put("testing", 99);
		
		
	}

	public int getOP(String msg){
		if(op.containsKey(msg))
		return op.get(msg);
		return 0;
	}
}
