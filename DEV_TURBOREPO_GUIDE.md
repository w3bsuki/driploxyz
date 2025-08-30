# 🚀 Turborepo Development Guide

## ✅ **FIXED: Port Conflicts Resolved**

I've identified and fixed the issue with `pnpm dev` not launching the entire turborepo.

### **The Problem Was**: Port Conflicts
- **web** app: port 5173 (default)
- **docs** app: port 5173 (default) ← **CONFLICT!**
- **admin** app: port 5174 ✅

### **The Fix**: Unique Ports
- **web** app: port 5173 ✅
- **docs** app: port 5175 ✅ **(FIXED)**
- **admin** app: port 5174 ✅

---

## 🔧 **How Turborepo Dev Should Work**

When you run `pnpm dev`, Turborepo should launch:

### **Apps (3 processes)**:
1. **web** → `http://localhost:5173` (main marketplace)
2. **admin** → `http://localhost:5174` (admin dashboard)  
3. **docs** → `http://localhost:5175` (documentation)

### **Packages (1 process)**:
4. **ui** → Watch mode (rebuilds components when changed)

---

## 📋 **Verification Steps**

### **1. Test the Fixed Configuration**
```bash
# Stop any running processes first
Ctrl+C (if dev server is running)

# Clear any port conflicts
npx kill-port 5173 5174 5175

# Start the full turborepo
pnpm dev
```

### **2. Expected Output**
You should see output like:
```
web:dev: Local:   http://localhost:5173/
admin:dev: Local: http://localhost:5174/
docs:dev: Local:  http://localhost:5175/
ui:dev: watching for changes...
```

### **3. Verify All Apps Are Running**
Open these URLs in your browser:
- ✅ **Main App**: http://localhost:5173
- ✅ **Admin**: http://localhost:5174  
- ✅ **Docs**: http://localhost:5175

---

## 🛠️ **Troubleshooting**

### **If Only One App Starts**:

1. **Check for Port Conflicts**:
   ```bash
   netstat -ano | findstr "5173"
   netstat -ano | findstr "5174" 
   netstat -ano | findstr "5175"
   ```

2. **Kill Conflicting Processes**:
   ```bash
   npx kill-port 5173 5174 5175
   ```

3. **Clear Caches**:
   ```bash
   rm -rf apps/*/node_modules/.vite
   rm -rf apps/*/.svelte-kit
   ```

### **If Packages Don't Build**:

1. **Check UI Package**:
   ```bash
   cd packages/ui
   pnpm build
   cd ../..
   ```

2. **Check Database Types**:
   ```bash
   pnpm db:types
   ```

### **If Turbo Command Fails**:

1. **Verify Turbo Installation**:
   ```bash
   pnpm list turbo
   ```

2. **Check Workspace Setup**:
   ```bash
   pnpm list --depth=0
   ```

---

## 🎯 **Development Workflow**

### **Standard Development**:
```bash
# Start everything
pnpm dev

# Work on specific app only
pnpm dev:web              # Just the main app
pnpm dev --filter admin   # Just admin
pnpm dev --filter docs    # Just docs
```

### **Production Testing**:
```bash
# Build everything
pnpm build

# Run production checks
pnpm production-check

# Test production build locally
pnpm preview
```

---

## 📊 **Turborepo Benefits**

With the fixed configuration, you get:

### **Parallel Development** ✅
- All apps run simultaneously
- Changes in shared packages auto-rebuild
- No manual coordination needed

### **Efficient Caching** ✅
- Turbo caches build outputs
- Only rebuilds what changed
- Faster development cycles

### **Integrated Tooling** ✅
- Shared linting, testing, formatting
- Consistent development experience
- Type-safe package imports

---

## 🚀 **Next Steps**

1. **Test the fix**: Run `pnpm dev` and verify all 4 processes start
2. **Bookmark the URLs**: Save the 3 localhost URLs for easy access
3. **Use filters**: Use `pnpm dev --filter web` for focused development
4. **Monitor logs**: Watch Turbo output for any issues

---

## 📞 **Still Having Issues?**

If `pnpm dev` still doesn't work:

1. **Share the exact output** of `pnpm dev`
2. **Check Node.js version**: `node --version` (should be >=18)
3. **Check pnpm version**: `pnpm --version` (should be >=10.0.0)
4. **Try fresh install**: 
   ```bash
   rm -rf node_modules
   rm -rf apps/*/node_modules
   rm -rf packages/*/node_modules
   pnpm install
   ```

The configuration should now work correctly! 🎉