package com.tradepulse.app.firebase

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

sealed class AuthResult {
    data class Success(val user: FirebaseUser?) : AuthResult()
    data class Error(val message: String) : AuthResult()
}

class FirebaseAuthManager {

    private val auth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }

    private val _currentUserState = MutableStateFlow<FirebaseUser?>(null)
    val currentUserState: StateFlow<FirebaseUser?> = _currentUserState.asStateFlow()

    init {
        try {
            _currentUserState.value = auth.currentUser
            auth.addAuthStateListener { firebaseAuth ->
                _currentUserState.value = firebaseAuth.currentUser
            }
        } catch (e: Exception) {
            // Graceful fallback for local development without active google-services configuration
            _currentUserState.value = null
        }
    }

    suspend fun signIn(email: String, pass: String): AuthResult {
        return try {
            val result = auth.signInWithEmailAndPassword(email, pass).await()
            _currentUserState.value = result.user
            AuthResult.Success(result.user)
        } catch (e: Exception) {
            AuthResult.Error(e.localizedMessage ?: "Authentication failed")
        }
    }

    suspend fun signUp(email: String, pass: String): AuthResult {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, pass).await()
            _currentUserState.value = result.user
            AuthResult.Success(result.user)
        } catch (e: Exception) {
            AuthResult.Error(e.localizedMessage ?: "Registration failed")
        }
    }

    fun signOut() {
        try {
            auth.signOut()
            _currentUserState.value = null
        } catch (e: Exception) {
            _currentUserState.value = null
        }
    }

    fun isUserLoggedIn(): Boolean {
        return _currentUserState.value != null
    }

    fun getUserEmail(): String {
        return _currentUserState.value?.email ?: "trader@tradepulse.ai"
    }
}
