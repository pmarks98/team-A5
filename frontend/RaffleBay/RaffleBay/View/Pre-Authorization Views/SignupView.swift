//
//  SignupView.swift
//  RaffleBay
//
//  Created by Meera Rachamallu on 2/6/20.
//  Copyright © 2020 Meera Rachamallu. All rights reserved.
//

import Foundation
import SwiftUI
import SwiftyJSON



//TO DO:
//Figure out a way when clicking outside of the form area
//the keyboard should be dismissed.


struct SignupView : View {
   @EnvironmentObject var navigation: NavigationStack
    //Create some user and use a password confirmation var to confirm
    @ObservedObject var someUser = User()
    @State private var pwdConfirm = String()
    @State var value: CGFloat = 0
    @State private var showingAlert = false
    var body: some View {
        
        
        ZStack(){

            HStack(){
                
                //Left Side Spacer
                Spacer()
                
                //Center Column
                VStack(){
                      
                    Spacer().frame(height: 180)
                    
                    VStack(){
                        TextField("First Name", text: $someUser.firstName)
                            .textFieldStyle(SignUpTextFieldStyle())
                            .onTapGesture {
                                self.value = signupFrameHeight * 0
                            }
                      
                        TextField("Last Name", text: $someUser.lastName)
                            .textFieldStyle(SignUpTextFieldStyle())
                            .onTapGesture {
                                self.value = signupFrameHeight * 1
                            }

                        TextField("Email", text: $someUser.email)
                            .textFieldStyle(SignUpTextFieldStyle())
                            .onTapGesture {
                                self.value = signupFrameHeight * 2
                            }

                        SecureField("Password", text: $someUser.password)
                            .textFieldStyle(SignUpTextFieldStyle())
                            .onTapGesture {
                                self.value = signupFrameHeight * 3
                            }

                        SecureField("Password Confirmation", text: $pwdConfirm)
                            .textFieldStyle(SignUpTextFieldStyle())
                            .onTapGesture {
                                self.value = signupFrameHeight * 4
                            }

                        TextField("Street Address", text: $someUser.streetAddress)
                            .textFieldStyle(SignUpTextFieldStyle())
                            .onTapGesture {
                                self.value = signupFrameHeight * 5
                            }

                        TextField("City", text: $someUser.city)
                            .textFieldStyle(SignUpTextFieldStyle())
                            .onTapGesture {
                                self.value = signupFrameHeight * 6
                            }

                        HStack(){
                            TextField("State", text: $someUser.state)
                            .textFieldStyle(SignUpTextFieldStyle())

                            TextField("Zipcode", text: $someUser.zipcode)
                            .textFieldStyle(SignUpTextFieldStyle())
                        }
                            .onTapGesture {
                                self.value = signupFrameHeight * 7
                            }

                        TextField("Phone Number", text: $someUser.phoneNumber)
                            .textFieldStyle(SignUpTextFieldStyle())
                            .keyboardType(.numberPad)
                            .onTapGesture {
                                self.value = signupFrameHeight * 8
                            }
                        
                        
                        TextField("Birthdate",  text: $someUser.birthdate)
                            .textFieldStyle(SignUpTextFieldStyle())
                            .onTapGesture {
                                self.value = signupFrameHeight * 9
                            }
                    }
                    
                    Spacer()

                    //Validations Here
                    if(someUser.password != pwdConfirm) {
                        Text("Your passwords do not match.")
                            .foregroundColor(.red)
                        
                    }
                    
                    //Login Stack
                    //ZStack here to allow for custom shadow manipulation.
                    ZStack(){
                        ShadowBoxView()
                        
                        //Signup Button
//                      NavigationLink(destination: LoginView()){
//                            Button(action: {
//                                post_signup(newUser: self.someUser)
//                            }){
//                            Text("Sign Up")
//                              .blueButtonText()
//                              .frame(minWidth:0, maxWidth: frameMaxWidth)
//                            }
//                            .buttonStyle(BigBlueButtonStyle())
//                        }
//                        .buttonStyle(BigBlueButtonStyle())
                        
                        //SignUp Button
                        Button(action: {
                            post_signup(newUser: self.someUser) {
                                response in
                                if response == true {
                                    //self.selection = response
                                    self.navigation.home()
                                } else {
                                    self.showingAlert = true
                                }
                            }
                                
                        }){
                            Text("Sign Up")
                                .blueButtonText()
                                .frame(minWidth:0, maxWidth: frameMaxWidth)
                        }
                        .buttonStyle(BigBlueButtonStyle())
                        .alert(isPresented: $showingAlert) {
                            Alert(title: Text("Error with Signup"), message: Text("Please make sure you filled in every field"), dismissButton: .default(Text("Got it!")))
                        }
                    }
                    
                    //Login Button
                     NavigationLink(destination: LoginView()){
                        Button(action: {
                            
                        }){
                            HStack(){
                                Text("Have an account?")
                                    .standardRegularText()
                                    .padding(8)
                   
                                Text("Login Here")
                                     .standardBoldText()
                                    .padding(8)
                            }
                        }

                    }
                    .buttonStyle(BigClearButtonStyle())
                 
                    }
                    .offset(y: -self.value)
                    .animation(.spring())
                    .onAppear(){
                        NotificationCenter.default.addObserver(forName: UIResponder.keyboardWillHideNotification, object: nil, queue: .main){ (noti) in
                            self.value = 0
                        }
                    }
                
                //Right Side Spacer
                Spacer()
            }
            //Overlay
            VStack(){
                
                //White Background to protect Back Button
                Rectangle().fill(Color.white).frame( height: 90 ).offset(y: 30)
                Spacer()
            }
            
        }
        
    }
}

struct SignupView_Previews: PreviewProvider {
    static var previews: some View {
        SignupView()
    }
}
