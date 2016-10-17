package com.example.spark.auth;

import java.util.List;

/**
 * User class.
 * @author Elitza Haltakova
 *
 */
public class User {

	private int id;
	private String username;
	private String firstName;
	private String lastName;
	private boolean admin;
	private boolean changePassword;
	private List<String> customers;
	
	public User(int id, String username, String firstName, String lastName, boolean admin, boolean changePassword, List<String> customers) {
		super();
		this.id = id;
		this.username = username;
		this.firstName = firstName;
		this.lastName = lastName;
		this.admin = admin;
		this.changePassword = changePassword;
		this.customers = customers;
	}
	
	public int getId() {
		return id;
	}
	
	public String getUsername() {
		return username;
	}
	
	public String getFirstName() {
		return firstName;
	}
	
	public String getLastName() {
		return lastName;
	}
	
	public boolean isAdmin() {
		return admin;
	}
	
	public boolean shouldChangePassword() {
		return changePassword;
	}
	
	public List<String> getCustomers() {
		return customers;
	}
}
