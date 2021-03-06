//
//  User.swift
//  RaffleBay
//
//  Created by Meera Rachamallu on 2/6/20.
//  Copyright © 2020 Meera Rachamallu. All rights reserved.
//

import Foundation
import SwiftUI

class User: ObservableObject {
    
    //TODO: Fill out based on class diagram
    
    
    //Acount Information from Sign Up
    @Published var firstName: String = ""
    @Published var lastName: String  = ""
    @Published var email: String = ""
    @Published var password: String = ""
    @Published var streetAddress: String = ""
    @Published var city: String = ""
    @Published var state: String = ""
    @Published var zipcode: String = ""
    @Published var phoneNumber: String = ""
    @Published var birthdate: String = ""
    @Published var pic_url: String = ""
    @Published var auth_token: String = ""
    @Published var account_balance: String = ""
    
}
