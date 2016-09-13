package backend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Models {
	Connection cnlocal;

	public Models() {
	}

	public JSONArray create_model(JSONObject msg) throws JSONException {
		JSONArray result = new JSONArray();
		JSONObject obj = new JSONObject();
		dbconnect();

		String insert = "Insert into " + Settings.lmtable + "(" + Settings.lmtable_name + "," + Settings.lmtable_uri
				+ "," + Settings.lmtable_pss + "," + Settings.lmtable_update + "," + Settings.lmtable_archived + ","
				+ Settings.lmtable_monitorfinal + "," + Settings.lmtable_creator + "," + Settings.lmtable_age + ","
				+ Settings.lmtable_gender + ") values (?,?,?,?,?,?,?,?,?)";
		PreparedStatement query1 = null;
		try {
			query1 = cnlocal.prepareStatement(insert, PreparedStatement.RETURN_GENERATED_KEYS);
			query1.setString(1, msg.getString("Name"));
			query1.setString(2, msg.getString("URI"));
			query1.setString(3, msg.getString("PSS"));
			query1.setInt(4, msg.getInt("Update"));
			query1.setBoolean(5, msg.getBoolean("Archive"));
			query1.setBoolean(6, msg.getBoolean("Final_Product"));
			query1.setInt(7, msg.getInt("User"));
			query1.setString(8, msg.getString("Age"));
			query1.setString(9, msg.getString("Gender"));
			query1.executeUpdate();
			ResultSet generatedKeys = query1.getGeneratedKeys();
			if (generatedKeys.next())
				obj.put("id", generatedKeys.getLong(1));
		} catch (SQLException e) {
			e.printStackTrace();
			obj.put("Op", "Error");
			obj.put("Message", "Error adding model to DB");
			result.put(obj);
			return result;
		} finally {
			try {
				if (query1 != null)
					query1.close();
				if (cnlocal != null)
					cnlocal.close();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}

		obj.put("Op", "Error");
		obj.put("Message", "Successfully added model " + msg.getString("Name") + " to monitor module");
		result.put(obj);
		return result;
	}

	public JSONArray get_models(JSONObject msg) {
		JSONArray result = new JSONArray();

		return result;
	}

	public JSONArray get_model(JSONObject msg) throws JSONException {
		JSONArray result = new JSONArray();
		JSONObject obj = new JSONObject();

		dbconnect();

		String select = "Select * from " + Settings.lmtable + " Where " + Settings.lmtable_id + "=?";

		PreparedStatement query1 = null;
		ResultSet rs = null;

		try {
			query1 = cnlocal.prepareStatement(select);
			query1.setInt(1, msg.getInt("Model"));
			rs = query1.executeQuery();
			if (rs.next()) {

				obj.put("Op", "Model");
				obj.put("Name", rs.getString(Settings.lmtable_name));
				obj.put("URI", rs.getString(Settings.lmtable_uri));
				obj.put("Update", rs.getString(Settings.lmtable_update));
				obj.put("PSS", rs.getString(Settings.lmtable_pss));
				obj.put("Age", rs.getString(Settings.lmtable_age));
				obj.put("Gender", rs.getString(Settings.lmtable_gender));
				obj.put("Final_products", rs.getBoolean(Settings.lmtable_monitorfinal));
				obj.put("Archive", rs.getBoolean(Settings.lmtable_archived));
				result.put(obj);

			} else {
				obj.put("Op", "Error");
				obj.put("Message", "Failed Returning Model Please Try Again");
				result.put(obj);

			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}
	/*
	 * Under Development Got Ahead of myself here public JSONArray
	 * update_model(JSONObject msg) { JSONArray result = new JSONArray();
	 * JSONObject obj = new JSONObject(); dbconnect();
	 * 
	 * String insert = "Update" +Settings.lmtable + "Set "+Settings.lmtable_age+
	 * "=? "+Settings.lmtable_gender+"=?"; PreparedStatement query1 = null; try{
	 * query1 =
	 * cnlocal.prepareStatement(insert,PreparedStatement.RETURN_GENERATED_KEYS);
	 * query1.setString(1, msg.getString("Name")); query1.setString(2,
	 * msg.getString("URI")); query1.setString(3, msg.getString("PSS"));
	 * query1.setInt(4, msg.getInt("Update")); query1.setBoolean(5,
	 * msg.getBoolean("Archive")); query1.setBoolean(6,
	 * msg.getBoolean("Final_Product")); query1.setInt(7, msg.getInt("User"));
	 * query1.setString(8, msg.getString("Age")); query1.setString(9,
	 * msg.getString("Gender")); query1.executeUpdate(); ResultSet generatedKeys
	 * = query1.getGeneratedKeys(); if (generatedKeys.next())
	 * obj.put("id",generatedKeys.getLong(1)); }catch(SQLException e){
	 * e.printStackTrace(); obj.put("Op", "Error"); obj.put("Message",
	 * "Error adding model to DB"); result.put(obj); return result; }
	 * 
	 * obj.put("Op", "Error"); obj.put("Message", "Successfully added model "
	 * +msg.getString("Name")+" to monitor module"); result.put(obj); return
	 * result; }
	 */

	private void dbconnect() {
		try {
			cnlocal = Settings.connlocal();
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
}
