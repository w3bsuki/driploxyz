# Pull Request

## 📝 Description

<!-- Provide a clear and concise description of what this PR does -->

**What changed:**
- 

**Why it was changed:**
- 

## 🔗 Related Issues

<!-- Link to any related issues using GitHub keywords -->
- Fixes #[issue_number]
- Closes #[issue_number]
- Related to #[issue_number]

## 🧪 Type of Change

<!-- Mark all that apply -->
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🔧 Configuration change
- [ ] 🎨 UI/UX improvement
- [ ] ⚡ Performance improvement
- [ ] 🔒 Security fix
- [ ] 🧹 Code cleanup/refactoring
- [ ] 🧪 Test improvement
- [ ] 📦 Dependency update

## 🏗️ Architecture Impact

<!-- Mark all that apply -->
- [ ] Database schema changes
- [ ] API changes (breaking/non-breaking)
- [ ] New dependencies added
- [ ] Environment variables added/changed
- [ ] Third-party integrations modified
- [ ] Authentication/authorization changes
- [ ] Caching strategy changes
- [ ] None

## 🧪 Testing

<!-- Describe the testing you've performed -->

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility testing completed
- [ ] Performance testing completed

### Test Scenarios Covered
<!-- List the key scenarios you've tested -->
- [ ] Happy path functionality
- [ ] Error handling
- [ ] Edge cases
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Manual Testing Checklist
<!-- Remove sections that don't apply -->

#### Authentication & Users
- [ ] Login/logout functionality
- [ ] User registration
- [ ] Password reset
- [ ] Profile updates

#### Products & Marketplace
- [ ] Product listing creation
- [ ] Product search and filtering
- [ ] Product details display
- [ ] Image upload and display

#### Transactions
- [ ] Add to cart functionality
- [ ] Checkout process
- [ ] Payment processing
- [ ] Order confirmation

#### Admin/Moderation
- [ ] Admin dashboard access
- [ ] User management
- [ ] Content moderation

## 📱 Platform Testing

<!-- Mark platforms you've tested on -->
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
- [ ] Desktop Edge

## 🔍 Code Quality

- [ ] Code follows established patterns and conventions
- [ ] No console.log or debug statements left in code
- [ ] Error handling implemented appropriately  
- [ ] TypeScript types are properly defined
- [ ] ESLint passes without warnings
- [ ] Prettier formatting applied
- [ ] No performance regressions introduced
- [ ] Security best practices followed

## 📊 Performance Impact

<!-- If applicable, describe performance impact -->
- [ ] No performance impact
- [ ] Minor performance improvement
- [ ] Significant performance improvement
- [ ] Minor performance regression (justified)
- [ ] Performance impact unknown/not measured

**Bundle size impact:** 
<!-- Use `pnpm analyze` to check bundle impact -->
- Bundle size change: +/- X KB
- New dependencies added: [list]

## 🔒 Security Considerations

- [ ] No security impact
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified  
- [ ] Authentication/authorization properly handled
- [ ] Sensitive data properly protected
- [ ] HTTPS enforced where needed

## ♿ Accessibility

- [ ] Semantic HTML used
- [ ] ARIA labels added where needed
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators visible
- [ ] No accessibility regressions

## 📋 Deployment Notes

<!-- Any special deployment considerations -->
- [ ] No special deployment needed
- [ ] Database migrations required
- [ ] Environment variables need to be updated
- [ ] Third-party service configuration needed
- [ ] Cache clearing required
- [ ] Backwards compatibility maintained

**Environment Variables:**
<!-- List any new or changed environment variables -->
```
NEW_VAR=example_value
UPDATED_VAR=new_value
```

**Migration Commands:**
<!-- List any database migrations or setup commands -->
```bash
# Example migration commands
pnpm db:migrate
```

## 📸 Screenshots/Videos

<!-- Add screenshots or videos demonstrating the changes -->

### Before
<!-- Screenshot of current state -->

### After
<!-- Screenshot of new state -->

## 📝 Documentation

- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Component documentation updated (if needed)
- [ ] Deployment guide updated (if needed)
- [ ] User guide updated (if needed)

## ✅ Final Checklist

<!-- Ensure all items are checked before requesting review -->
- [ ] All tests are passing
- [ ] Code has been self-reviewed
- [ ] Code follows project conventions and style guide
- [ ] Changes are backwards compatible (or breaking changes are documented)
- [ ] New dependencies are justified and properly licensed
- [ ] Security implications have been considered
- [ ] Performance impact has been considered
- [ ] Accessibility requirements are met
- [ ] Documentation has been updated
- [ ] Related issues have been linked

## 👥 Review Requests

<!-- Tag relevant team members or teams -->
**Reviewers needed:**
- [ ] @driplo/core-team (required for breaking changes)
- [ ] @driplo/frontend-team (for UI changes)
- [ ] @driplo/backend-team (for API changes)  
- [ ] @driplo/security-team (for security-related changes)
- [ ] @driplo/design-team (for design changes)

**Additional context for reviewers:**
<!-- Add any specific areas you'd like reviewers to focus on -->
- Please pay special attention to [specific area]
- This change affects [specific functionality]
- Known limitation: [describe limitation]

---

## 🚀 Post-Merge Tasks

<!-- Tasks to complete after the PR is merged -->
- [ ] Deploy to staging environment
- [ ] Verify functionality in staging
- [ ] Monitor error rates after deployment
- [ ] Update project board/issues
- [ ] Notify stakeholders of changes
- [ ] Update analytics/tracking (if applicable)

---

*Thank you for contributing to Driplo! 🙏*