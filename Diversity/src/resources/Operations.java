package resources;

import java.util.HashMap;

public class Operations {
	private HashMap<String,Integer> op;
	
	
	public Operations(){
		op = new HashMap<String,Integer>();
		op.put("chartrequest", 1);
		
		
	}

	public int getOP(String msg){
		if(op.containsKey(msg))
		return op.get(msg);
		return 0;
	}
}
