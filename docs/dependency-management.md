# Dependency Management Strategy

## Overview
This document outlines best practices for managing dependencies in the DocBooking project to ensure stability, predictability, and safety from breaking changes.

## Current Setup (April 12, 2026)

### Locked Dependencies
All dependencies are locked to exact versions in `package.json`:
- `next`: 16.2.2
- `react`: 19.2.4
- `react-dom`: 19.2.4
- `tailwindcss`: 4.0.5
- `mongoose`: 9.3.3
- `nodemailer`: 8.0.5
- And all others (see package.json)

### Node Version
- **Required**: Node 18.x
- **Recommended**: Node 18.20.0 or later
- Configured in: `.nvmrc` and `package.json` → `engines.node`

### npm Version
- **Required**: npm 10.x

## Rules

### ❌ DO NOT
1. Run `npm update` directly
2. Use version specifiers like `^` or `~`
3. Manually modify `package-lock.json`
4. Upgrade multiple packages at once
5. Deploy without local testing

### ✅ DO
1. Use `npm ci` for production installs (uses exact versions)
2. Use `npm ci` in CI/CD pipelines (GitHub Actions, Vercel)
3. Create a git branch before any dependency upgrade
4. Test locally before pushing changes
5. Document all dependency changes in commit messages

## Upgrade Procedure

### For Security Patches (Recommended)
1. **Identify** the security vulnerability
2. **Create branch**: `git checkout -b security/package-name-version`
3. **Update one package**: Edit `package.json` with new version
4. **Update lock file**: `npm install`
5. **Test locally**: `npm run build && npm run start`
6. **Review**: Check for any warnings or errors
7. **Commit**: `git commit -m "security: upgrade package-name to version X.Y.Z"`
8. **Push & Test**: Push to GitHub for CI/CD testing
9. **Deploy**: Merge after verification

### For Feature Upgrades (Non-Security)
1. Evaluate if upgrade is necessary
2. Check changelog for breaking changes
3. Follow same procedure as security patches
4. Be extra cautious with Next.js and React upgrades

### For Minor Version Bumps
Use this approach for updates like:
- `16.2.2` → `16.2.3` (patch)
- `16.2.x` → `16.3.0` (minor) - need testing

### For Major Version Bumps
- Should be rare
- Requires full test suite validation
- Plan 1-2 weeks for integration
- Update documentation

## Dependency Safety Checklist

Before deploying any upgrade:
- [ ] Lock file (`package-lock.json`) updated
- [ ] Build succeeds: `npm run build`
- [ ] Dev server works: `npm run dev`
- [ ] No console errors or warnings
- [ ] Tested all user flows (at minimum)
- [ ] Vercel build succeeds
- [ ] No performance regression

## Current Locked Versions

### Production Dependencies
```
@tailwindcss/postcss: 4.0.1
@types/nodemailer: 8.0.0
autoprefixer: 10.4.20
clsx: 2.1.1
date-fns: 4.1.0
dotenv: 17.4.0
lucide-react: 1.7.0
mongoose: 9.3.3
next: 16.2.2 ⭐
nodemailer: 8.0.5
postcss: 8.4.41
react: 19.2.4 ⭐
react-day-picker: 9.14.0
react-dom: 19.2.4 ⭐
tailwind-merge: 3.5.0
tailwindcss: 4.0.5
vercel: 50.44.0
zod: 3.25.76
```

### Development Dependencies
```
@types/node: 20.19.39
@types/react: 19.2.14
@types/react-dom: 19.2.14
eslint: 9.14.0
eslint-config-next: 16.2.2
typescript: 5.9.3
```

⭐ = Framework/Core dependencies (highest priority for compatibility)

## Known Compatibility Notes

### Next.js 16.2.2
- Compatible with React 19.2.4
- Uses Turbopack for builds
- Requires Node 18.x or higher

### React 19.2.4
- Latest stable version
- Includes React Compiler optimizations
- Compatible with React DOM 19.2.4

### Mongoose 9.3.3
- Requires Node 18+
- MongoDB 4.4+
- Works with existing models

### Tailwind CSS 4.0.5
- Post-CSS 8.4.41 required
- Modern CSS features enabled
- Autoprefixer 10.4.20 compatible

## Scripts for Safety

```bash
# Use this instead of npm install
npm ci

# Safe build verification
npm run build

# Development testing
npm run dev

# Production test
npm run start
```

## Emergency Procedures

### If Build Breaks After Upgrade
1. Identify which package was upgraded
2. Revert change: `git revert <commit-hash>`
3. Reinstall: `npm ci`
4. Verify: `npm run build`
5. Investigate root cause before re-attempting

### If Lock File is Corrupted
1. Delete `package-lock.json`
2. Run: `npm install`
3. Commit the new lock file
4. Test thoroughly

## Monitoring Dependencies

### Check for Updates
```bash
npm outdated
```
Shows which packages are outdated (but does NOT upgrade)

### Audit Security
```bash
npm audit
```
Lists security vulnerabilities

### Audit Fix (With Care)
```bash
npm audit fix
```
Only run in a test branch first!

## Vercel Configuration

- ✅ Vercel auto-detects Node version (uses .nvmrc)
- ✅ Vercel uses `npm ci` for installs (respects lock file)
- ✅ Vercel runs `npm run build` automatically
- ✅ Environment variables synced in dashboard

## Contact & Questions

For dependency-related questions:
1. Check this document first
2. Review the diff of any proposed change
3. Test in a separate branch
4. Ask for code review before merging

## Changelog

### 2026-04-12 - Initial Lockdown
- All dependencies locked to exact versions
- Node 18.x requirement added
- Dependency management strategy documented
- `.nvmrc` file created for NVM users
- `npm ci` script added for safe installs
