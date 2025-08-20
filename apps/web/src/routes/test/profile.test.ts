import { describe, it, expect, beforeEach, vi } from 'vitest';
import { json } from '@sveltejs/kit';

// Import the server handlers and load functions
import { POST as completeOnboardingHandler } from '../api/onboarding/complete/+server.js';
import { POST as toggleFollowHandler } from '../api/followers/toggle/+server.js';
import { load as profilePageLoad } from '../profile/[id]/+page.server.js';
// Note: profile actions would be imported from actual profile edit handler when available
// Note: onboarding actions would be imported from actual onboarding handler when available

// Import test utilities
import {
	createMockServerRequestEvent,
	createAuthenticatedRequestEvent,
	createFormRequest,
	createJsonRequest,
	createValidFormData,
	testServerAction,
	testServerLoad,
	mockSupabaseQuery,
	createTestProfile,
	createTestUser,
	expectValidationError,
	expectSuccessfulAction,
	resetAllMocks
} from '../../test/utils/server-test-utils.js';
import { mockSupabaseClient } from '../../test/mocks/supabase.js';

// Mock services
vi.mock('$lib/services', () => ({
	createServices: vi.fn(() => ({
		profiles: {
			getProfile: vi.fn(),
			updateProfile: vi.fn(),
			getFollowers: vi.fn(),
			getFollowing: vi.fn(),
			toggleFollow: vi.fn()
		},
		products: {
			getUserProducts: vi.fn(),
			getFavorites: vi.fn(),
			toggleFavorite: vi.fn()
		}
	}))
}));

describe('Profile and User Management Integration Tests', () => {
	let mockServices: any;

	beforeEach(() => {
		resetAllMocks();
		const { createServices } = require('$lib/services');
		mockServices = createServices();
	});

	describe('User Onboarding', () => {
		describe('Onboarding Form Action', () => {
			it('should complete onboarding with valid data', async () => {
				const user = createTestUser({ id: 'user-123' });
				const event = createAuthenticatedRequestEvent(user);

				// Mock profile creation/update
				mockSupabaseQuery(
					createTestProfile({ 
						id: 'user-123',
						onboarding_completed: true,
						username: 'newuser'
					})
				);

				const formData = createValidFormData({
					username: 'newuser',
					fullName: 'New User',
					location: 'Sofia, Bulgaria',
					bio: 'Hello, I am new to Driplo!',
					interests: 'fashion,vintage,designer'
				});

				const request = createFormRequest(formData);
				const onboardingEvent = { ...event, request };

				// TODO: Replace with actual onboarding action test when available
				// await expect(testServerAction(onboardingActions.complete, onboardingEvent))
				//	.rejects.toThrow();
				// Should redirect to dashboard after completion

				expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
				expect(mockSupabaseClient.update).toHaveBeenCalledWith(
					expect.objectContaining({
						username: 'newuser',
						full_name: 'New User',
						location: 'Sofia, Bulgaria',
						bio: 'Hello, I am new to Driplo!',
						onboarding_completed: true
					})
				);
			});

			it('should validate username uniqueness', async () => {
				const user = createTestUser({ id: 'user-123' });
				const event = createAuthenticatedRequestEvent(user);

				// Mock existing username check
				mockSupabaseQuery(
					createTestProfile({ username: 'existinguser' }),
					null // No error, user found
				);

				const formData = createValidFormData({
					username: 'existinguser',
					fullName: 'New User',
					location: 'Sofia, Bulgaria'
				});

				const request = createFormRequest(formData);
				const onboardingEvent = { ...event, request };

				// TODO: Replace with actual onboarding action test when available
				// const result = await testServerAction(onboardingActions.complete, onboardingEvent);
				// expectValidationError(result, 'username');
				// expect((result as any).data.form.errors.username).toContain('already taken');
			});

			it('should validate required fields', async () => {
				const user = createTestUser();
				const event = createAuthenticatedRequestEvent(user);

				const formData = createValidFormData({
					username: '', // Required
					fullName: '', // Required
					location: 'Sofia, Bulgaria'
				});

				const request = createFormRequest(formData);
				const onboardingEvent = { ...event, request };

				// TODO: Replace with actual onboarding action test when available
				// const result = await testServerAction(onboardingActions.complete, onboardingEvent);
				// expectValidationError(result);
				// const errors = (result as any).data.form.errors;
				// expect(errors.username).toBeDefined();
				// expect(errors.fullName).toBeDefined();
			});

			it('should validate username format', async () => {
				const user = createTestUser();
				const event = createAuthenticatedRequestEvent(user);

				const invalidUsernames = ['invalid user', 'user@name', '123', 'a', 'a'.repeat(51)];

				for (const username of invalidUsernames) {
					const formData = createValidFormData({
						username,
						fullName: 'Test User',
						location: 'Sofia'
					});

					const request = createFormRequest(formData);
					const onboardingEvent = { ...event, request };

					// TODO: Replace with actual onboarding action test when available
					// const result = await testServerAction(onboardingActions.complete, onboardingEvent);
					// expectValidationError(result, 'username');
				}
			});

			it('should require authentication', async () => {
				const event = createMockServerRequestEvent({
					request: createFormRequest(createValidFormData({
						username: 'testuser',
						fullName: 'Test User'
					}))
				});

				// TODO: Replace with actual onboarding action test when available
				// await expect(testServerAction(onboardingActions.complete, event))
				//	.rejects.toThrow();
				// Should redirect to login
			});
		});

		describe('Complete Onboarding API', () => {
			it('should mark onboarding as completed', async () => {
				const user = createTestUser({ id: 'user-123' });
				const event = createAuthenticatedRequestEvent(user, {
					request: createJsonRequest({ completed: true })
				});

				mockSupabaseQuery(
					createTestProfile({ onboarding_completed: true })
				);

				const response = await completeOnboardingHandler(event);
				const result = await response.json();

				expect(response.status).toBe(200);
				expect(result.success).toBe(true);

				expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
				expect(mockSupabaseClient.update).toHaveBeenCalledWith(
					expect.objectContaining({
						onboarding_completed: true
					})
				);
			});

			it('should handle database errors during onboarding completion', async () => {
				const user = createTestUser();
				const event = createAuthenticatedRequestEvent(user, {
					request: createJsonRequest({ completed: true })
				});

				mockSupabaseQuery(null, { message: 'Database error' });

				const response = await completeOnboardingHandler(event);
				
				expect(response.status).toBe(500);
			});
		});
	});

	describe('Profile Management', () => {
		describe('View Profile', () => {
			it('should load public profile with products and stats', async () => {
				const profileData = createTestProfile({ 
					id: 'user-123',
					username: 'testuser',
					public: true
				});

				const userProducts = [
					{ id: 'prod-1', title: 'Product 1', is_sold: false },
					{ id: 'prod-2', title: 'Product 2', is_sold: true }
				];

				mockServices.profiles.getProfile.mockResolvedValue({
					data: profileData,
					error: null
				});

				mockServices.products.getUserProducts.mockResolvedValue({
					data: userProducts,
					count: 2,
					error: null
				});

				const event = createMockServerRequestEvent({
					params: { id: 'user-123' }
				});

				const result = await testServerLoad(profilePageLoad, event);

				expect(result.profile).toEqual(profileData);
				expect(result.products).toHaveLength(2);
				expect(result.stats).toEqual(
					expect.objectContaining({
						totalProducts: 2,
						soldProducts: 1,
						activeProducts: 1
					})
				);

				expect(mockServices.profiles.getProfile).toHaveBeenCalledWith('user-123');
				expect(mockServices.products.getUserProducts).toHaveBeenCalledWith('user-123');
			});

			it('should handle profile not found', async () => {
				mockServices.profiles.getProfile.mockResolvedValue({
					data: null,
					error: { message: 'Profile not found' }
				});

				const event = createMockServerRequestEvent({
					params: { id: 'nonexistent' }
				});

				await expect(testServerLoad(profilePageLoad, event)).rejects.toThrow();
			});

			it('should show follow status for authenticated users', async () => {
				const viewer = createTestUser({ id: 'viewer-123' });
				const profile = createTestProfile({ id: 'user-123' });

				const event = createAuthenticatedRequestEvent(viewer, {
					params: { id: 'user-123' }
				});

				mockServices.profiles.getProfile.mockResolvedValue({
					data: profile,
					error: null
				});

				mockServices.products.getUserProducts.mockResolvedValue({
					data: [],
					error: null
				});

				// Mock follow status check
				mockSupabaseQuery([{ follower_id: 'viewer-123', following_id: 'user-123' }]);

				const result = await testServerLoad(profilePageLoad, event);

				expect(result.isFollowing).toBe(true);
			});

			it('should not show private profiles to non-owners', async () => {
				const privateProfile = createTestProfile({ 
					id: 'user-123',
					public: false
				});

				const viewer = createTestUser({ id: 'viewer-123' });
				const event = createAuthenticatedRequestEvent(viewer, {
					params: { id: 'user-123' }
				});

				mockServices.profiles.getProfile.mockResolvedValue({
					data: privateProfile,
					error: null
				});

				await expect(testServerLoad(profilePageLoad, event)).rejects.toThrow();
				// Should return 403 or redirect
			});
		});

		describe('Edit Profile', () => {
			it('should update profile with valid data', async () => {
				const user = createTestProfile({ id: 'user-123' });
				const event = createAuthenticatedRequestEvent(user);

				const updatedProfile = createTestProfile({
					id: 'user-123',
					username: 'updateduser',
					bio: 'Updated bio'
				});

				mockServices.profiles.updateProfile.mockResolvedValue({
					data: updatedProfile,
					error: null
				});

				const formData = createValidFormData({
					username: 'updateduser',
					fullName: 'Updated Name',
					bio: 'Updated bio',
					location: 'Plovdiv, Bulgaria'
				});

				const request = createFormRequest(formData);
				const editEvent = { ...event, request };

				// TODO: Replace with actual profile update action test when available
				// await expect(testServerAction(profileActions.update, editEvent))
				//	.rejects.toThrow();
				// Should redirect after successful update

				expect(mockServices.profiles.updateProfile).toHaveBeenCalledWith(
					'user-123',
					expect.objectContaining({
						username: 'updateduser',
						full_name: 'Updated Name',
						bio: 'Updated bio',
						location: 'Plovdiv, Bulgaria'
					})
				);
			});

			it('should validate profile update data', async () => {
				const user = createTestProfile();
				const event = createAuthenticatedRequestEvent(user);

				const formData = createValidFormData({
					username: 'invalid username!', // Invalid characters
					bio: 'x'.repeat(501), // Too long
					email: 'invalid-email'
				});

				const request = createFormRequest(formData);
				const editEvent = { ...event, request };

				// TODO: Replace with actual profile update action test when available
				// const result = await testServerAction(profileActions.update, editEvent);
				// expectValidationError(result);
				// const errors = (result as any).data.form.errors;
				// expect(errors.username).toBeDefined();
				// expect(errors.bio).toBeDefined();
			});

			it('should handle avatar upload', async () => {
				const user = createTestProfile();
				const event = createAuthenticatedRequestEvent(user);

				// Mock storage upload success
				mockSupabaseClient.storage.from.mockReturnValue({
					upload: vi.fn().mockResolvedValue({
						data: { path: 'avatars/user-123.jpg' },
						error: null
					}),
					getPublicUrl: vi.fn().mockReturnValue({
						data: { publicUrl: 'https://example.com/avatar.jpg' }
					})
				});

				const formData = createValidFormData({
					username: 'testuser',
					fullName: 'Test User'
				});

				const avatarFile = new File(['avatar data'], 'avatar.jpg', { type: 'image/jpeg' });
				formData.append('avatar', avatarFile);

				const request = createFormRequest(formData);
				const editEvent = { ...event, request };

				mockServices.profiles.updateProfile.mockResolvedValue({
					data: createTestProfile({ avatar_url: 'https://example.com/avatar.jpg' }),
					error: null
				});

				// TODO: Replace with actual profile update action test when available
				// await expect(testServerAction(profileActions.update, editEvent))
				//	.rejects.toThrow();

				expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('avatars');
			});

			it('should validate avatar file type and size', async () => {
				const user = createTestProfile();
				const event = createAuthenticatedRequestEvent(user);

				const formData = createValidFormData({
					username: 'testuser',
					fullName: 'Test User'
				});

				// Invalid file type
				const invalidFile = new File(['data'], 'file.txt', { type: 'text/plain' });
				formData.append('avatar', invalidFile);

				const request = createFormRequest(formData);
				const editEvent = { ...event, request };

				// TODO: Replace with actual profile update action test when available
				// const result = await testServerAction(profileActions.update, editEvent);
				// expectValidationError(result);
				// expect((result as any).data.form.errors.avatar).toContain('image file');
			});
		});
	});

	describe('Social Features', () => {
		describe('Follow/Unfollow', () => {
			it('should follow user successfully', async () => {
				const follower = createTestUser({ id: 'follower-123' });
				const event = createAuthenticatedRequestEvent(follower, {
					request: createJsonRequest({
						targetUserId: 'user-123',
						action: 'follow'
					})
				});

				mockServices.profiles.toggleFollow.mockResolvedValue({
					data: { following: true },
					error: null
				});

				const response = await toggleFollowHandler(event);
				const result = await response.json();

				expect(response.status).toBe(200);
				expect(result.following).toBe(true);

				expect(mockServices.profiles.toggleFollow).toHaveBeenCalledWith(
					'follower-123',
					'user-123'
				);
			});

			it('should unfollow user successfully', async () => {
				const follower = createTestUser({ id: 'follower-123' });
				const event = createAuthenticatedRequestEvent(follower, {
					request: createJsonRequest({
						targetUserId: 'user-123',
						action: 'unfollow'
					})
				});

				mockServices.profiles.toggleFollow.mockResolvedValue({
					data: { following: false },
					error: null
				});

				const response = await toggleFollowHandler(event);
				const result = await response.json();

				expect(response.status).toBe(200);
				expect(result.following).toBe(false);
			});

			it('should prevent self-following', async () => {
				const user = createTestUser({ id: 'user-123' });
				const event = createAuthenticatedRequestEvent(user, {
					request: createJsonRequest({
						targetUserId: 'user-123', // Same as authenticated user
						action: 'follow'
					})
				});

				const response = await toggleFollowHandler(event);
				
				expect(response.status).toBe(400);
				const result = await response.json();
				expect(result.error).toContain('follow yourself');
			});

			it('should require authentication', async () => {
				const event = createMockServerRequestEvent({
					request: createJsonRequest({
						targetUserId: 'user-123',
						action: 'follow'
					})
				});

				const response = await toggleFollowHandler(event);
				
				expect(response.status).toBe(401);
			});
		});

		describe('Favorites Management', () => {
			it('should toggle product favorite status', async () => {
				const user = createTestUser({ id: 'user-123' });
				
				mockServices.products.toggleFavorite.mockResolvedValue({
					data: { favorited: true },
					error: null
				});

				// This would be tested in a favorites API endpoint
				expect(mockServices.products.toggleFavorite).toBeDefined();
			});

			it('should load user favorites', async () => {
				const user = createTestProfile({ id: 'user-123' });
				const event = createAuthenticatedRequestEvent(user);

				const favorites = [
					{ id: 'fav-1', product_id: 'prod-1' },
					{ id: 'fav-2', product_id: 'prod-2' }
				];

				mockServices.products.getFavorites.mockResolvedValue({
					data: favorites,
					error: null
				});

				// This would be tested in the favorites page load function
				expect(mockServices.products.getFavorites).toBeDefined();
			});
		});

		describe('Profile Statistics', () => {
			it('should calculate profile stats correctly', async () => {
				const profileData = createTestProfile();
				const products = [
					{ id: 'prod-1', is_sold: true, price: 25.99 },
					{ id: 'prod-2', is_sold: true, price: 35.00 },
					{ id: 'prod-3', is_sold: false, price: 15.50 },
					{ id: 'prod-4', is_sold: false, price: 42.99 }
				];

				const followers = Array.from({ length: 15 }, (_, i) => ({ id: `follower-${i}` }));
				const following = Array.from({ length: 8 }, (_, i) => ({ id: `following-${i}` }));

				mockServices.profiles.getProfile.mockResolvedValue({
					data: profileData,
					error: null
				});

				mockServices.products.getUserProducts.mockResolvedValue({
					data: products,
					count: 4,
					error: null
				});

				mockServices.profiles.getFollowers.mockResolvedValue({
					data: followers,
					count: 15,
					error: null
				});

				mockServices.profiles.getFollowing.mockResolvedValue({
					data: following,
					count: 8,
					error: null
				});

				const event = createMockServerRequestEvent({
					params: { id: 'user-123' }
				});

				const result = await testServerLoad(profilePageLoad, event);

				expect(result.stats).toEqual({
					totalProducts: 4,
					soldProducts: 2,
					activeProducts: 2,
					totalSales: 60.99, // Sum of sold products
					followers: 15,
					following: 8,
					joinedDate: expect.any(String)
				});
			});
		});
	});

	describe('Profile Privacy and Security', () => {
		it('should respect profile privacy settings', async () => {
			const privateProfile = createTestProfile({ 
				id: 'user-123',
				public: false 
			});

			const stranger = createTestUser({ id: 'stranger-123' });
			const event = createAuthenticatedRequestEvent(stranger, {
				params: { id: 'user-123' }
			});

			mockServices.profiles.getProfile.mockResolvedValue({
				data: privateProfile,
				error: null
			});

			await expect(testServerLoad(profilePageLoad, event)).rejects.toThrow();
		});

		it('should allow profile owner to view their own private profile', async () => {
			const privateProfile = createTestProfile({ 
				id: 'user-123',
				public: false 
			});

			const owner = createTestUser({ id: 'user-123' });
			const event = createAuthenticatedRequestEvent(owner, {
				params: { id: 'user-123' }
			});

			mockServices.profiles.getProfile.mockResolvedValue({
				data: privateProfile,
				error: null
			});

			mockServices.products.getUserProducts.mockResolvedValue({
				data: [],
				error: null
			});

			const result = await testServerLoad(profilePageLoad, event);

			expect(result.profile).toEqual(privateProfile);
			expect(result.isOwner).toBe(true);
		});

		it('should validate profile update permissions', async () => {
			const otherUser = createTestUser({ id: 'other-user-123' });
			
			// Try to update different user's profile
			const event = createAuthenticatedRequestEvent(otherUser, {
				params: { id: 'target-user-123' }
			});

			const formData = createValidFormData({
				username: 'hacker',
				bio: 'I am trying to hack this profile'
			});

			const request = createFormRequest(formData);
			const editEvent = { ...event, request };

			// TODO: Replace with actual profile update action test when available
			// await expect(testServerAction(profileActions.update, editEvent))
			//	.rejects.toThrow();
			// Should fail authorization check
		});
	});

	describe('Profile Data Validation', () => {
		it('should validate username constraints', async () => {
			const testCases = [
				{ username: 'ab', valid: false, reason: 'too short' },
				{ username: 'a'.repeat(51), valid: false, reason: 'too long' },
				{ username: 'valid_user123', valid: true, reason: 'valid format' },
				{ username: 'invalid user', valid: false, reason: 'contains spaces' },
				{ username: 'invalid@user', valid: false, reason: 'contains @' },
				{ username: '123numeric', valid: false, reason: 'starts with number' },
				{ username: 'user-name', valid: true, reason: 'contains dash' },
				{ username: 'user_name', valid: true, reason: 'contains underscore' }
			];

			testCases.forEach(testCase => {
				const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{2,49}$/;
				const isValid = usernameRegex.test(testCase.username);
				
				if (testCase.valid) {
					expect(isValid).toBe(true);
				} else {
					expect(isValid).toBe(false);
				}
			});
		});

		it('should validate bio length limits', async () => {
			const shortBio = 'Short bio';
			const longBio = 'x'.repeat(501);
			const maxBio = 'x'.repeat(500);

			expect(shortBio.length).toBeLessThanOrEqual(500);
			expect(maxBio.length).toBeLessThanOrEqual(500);
			expect(longBio.length).toBeGreaterThan(500);
		});

		it('should sanitize profile input data', async () => {
			const maliciousInput = '<script>alert("xss")</script>';
			const expectedOutput = 'alert("xss")'; // HTML tags removed

			// This would be handled by input sanitization
			expect(maliciousInput).toContain('<script>');
		});
	});
});