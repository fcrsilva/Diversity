package modeling;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import general.Data;
import general.Model;

public class GetModels {
	public GetModels() {
	}

	public JSONArray get_models() throws JSONException {

		JSONArray result = new JSONArray();
		result.put(new JSONObject().put("Op", "Models"));

		Data.modeldb.forEach((k, v) -> {
			if (v.getArchived() == false) {
				JSONObject obj = new JSONObject();
				try {
					obj.put("Name", v.getName());
					obj.put("Id", v.getId());
					obj.put("PSS", Data.pssdb.get(v.getPSS()).getName());
					result.put(obj);
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

		});
		return result;
	}

	public JSONArray create_model(JSONObject msg) throws JSONException {
		Model add = new Model();
		JSONArray result;
		result = add.add_model(msg);
		if (!(result.getJSONObject(0).getString("Op").equals("Error"))) {
			Data.modeldb.put(add.getId(), add);
			//long id = add.getId();
			//System.out.println(id);
		}
		
		result.put(0, result.getJSONObject(0).put("Op", "Error"));
		return result;

	}

	public JSONArray get_model(JSONObject msg) throws JSONException {
		JSONArray result = new JSONArray();
		JSONObject obj = new JSONObject();
		Model model = new Model();

		model=Data.modeldb.get(msg.getLong("Id"));
		if(model!=null){
		obj.put("Op", "Model");
		obj.put("Name", model.getName());
		obj.put("URI", model.getURI());
		obj.put("Update", model.getFrequency());
		obj.put("PSS", Data.pssdb.get(model.getPSS()).getName());
		//obj.put("Age", model.getAge());
		//obj.put("Gender", model.getGender());
		String Products = new String();
		for(String a : model.getProducts().split(",")){
			Products+=a+";";
		}
		obj.put("Final_products", Products);
		obj.put("Archive", model.getArchived());
		result.put(obj);
		}else{
			obj.put("Op", "Error");
			obj.put("Message", "Failed to get model please try again");
			result.put(obj);
		}

		return result;
	}

	public JSONArray update_model(JSONObject msg) throws JSONException {
		JSONArray result=new JSONArray();
		JSONObject obj = new JSONObject();
		Model model = new Model();
		model = Data.modeldb.get(msg.getLong("Id"));
		if(model !=null){
			return model.update_model(msg);
		}else{
			obj.put("Op", "Error");
			obj.put("Message", "Error no such model exists");
			result.put(obj);
			return result;
		}
	}
}
