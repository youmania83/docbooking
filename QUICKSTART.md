# 🏃 Quick Start Guide - DocBooking.in

## ⚡ 30-Second Setup

```bash
cd /Users/yogeshkumarwadhwa/Documents/Docbooking
npm run dev
```

Then open: **http://localhost:3000** 🎉

**That's it! Your website is live.**

---

## 🎯 What You Can Do

1. **Homepage** - See the hero section with "Skip OPD Queues in Panipat"
2. **Click "Book Appointment"** - Goes to doctor listing
3. **View 4 Doctors** - Dr. Tushar, Dr. Ashootosh, Dr. Keerat, Dr. Pankaj
4. **Click "View & Book"** - Open doctor detail page
5. **Select Time Slot** - Click any available time (gets highlighted)
6. **Confirm Booking** - Shows demo confirmation alert
7. **Go Back** - Browse other doctors

---

## 🔧 Commands

```bash
# Start development (auto-refresh on file changes)
npm run dev

# Build for production
npm run build

# Run built version
npm start

# Check for errors
npm run lint
```

---

## 📱 Test on Different Devices

- **Desktop**: http://localhost:3000 (open in browser)
- **Mobile**: http://192.168.1.38:3000 (on same network)
- **Tablet**: Same as mobile URL, just larger screen

---

## 👨‍⚕️ 4 Doctors Included

1. **Dr. Tushar Kalra** - General Physician - ₹300
   - Slots: 10:00 AM, 11:30 AM, 1:00 PM, 3:00 PM

2. **Dr. Ashootosh Kalra** - Surgeon - ₹500
   - Slots: 9:00 AM, 11:00 AM, 2:00 PM, 4:00 PM, 5:30 PM

3. **Dr. Keerat Kalra** - Gynecologist - ₹400
   - Slots: 10:00 AM, 12:00 PM, 2:00 PM, 4:00 PM

4. **Dr. Pankaj Bajaj** - Orthopedic - ₹600
   - Slots: 9:30 AM, 11:30 AM, 1:30 PM, 3:30 PM, 5:00 PM

---

## 📂 Project Files

```
✅ app/page.tsx                    - Homepage
✅ app/doctors/page.tsx            - Doctor listing
✅ app/doctor/[id]/page.tsx        - Booking page
✅ components/DoctorCard.tsx       - Reusable component
✅ lib/data.ts                     - Doctor data
✅ app/layout.tsx                  - Header & layout
✅ package.json                    - Dependencies
✅ README.md                       - Full documentation
✅ SETUP_GUIDE.md                  - Detailed setup
✅ CODE_REFERENCE.md               - Code snippets
✅ Tailwind CSS                    - Styling
✅ TypeScript                      - Type safety
```

---

## 🎨 Features

✅ Professional blue & white design  
✅ Responsive (mobile, tablet, desktop)  
✅ Smooth animations & hover effects  
✅ Easy to customize  
✅ No backend required  
✅ Demo booking confirmation  
✅ Clean, modern UI  
✅ Healthcare-themed  

---

## 🚨 If Something Goes Wrong

### Port 3000 is already in use?
```bash
npm run dev -- -p 3001
```
Then open: http://localhost:3001

### Styling looks broken?
```bash
npm install
npm run dev
```

### TypeScript errors?
```bash
# Clear cache
rm -rf .next
npm run dev
```

---

## 📝 To Customize

1. **Change doctor data** → Edit `lib/data.ts`
2. **Change colors** → Search replace in `.tsx` files
3. **Change text** → Edit the `.tsx` files directly
4. **Change time slots** → Edit `slots` array in `lib/data.ts`
5. **Add new doctors** → Add to array in `lib/data.ts`

---

## 🌍 Pages & Routes

| URL | Page | What's There |
|-----|------|-------------|
| localhost:3000 | Homepage | Hero, features, CTA |
| localhost:3000/doctors | Doctor List | 4 doctor cards |
| localhost:3000/doctor/1 | Booking | Dr. Tushar booking |
| localhost:3000/doctor/2 | Booking | Dr. Ashootosh booking |
| localhost:3000/doctor/3 | Booking | Dr. Keerat booking |
| localhost:3000/doctor/4 | Booking | Dr. Pankaj booking |

---

## 💡 Pro Tips

1. **Auto-reload**: Edit any file and browser refreshes automatically
2. **Mobile test**: Use the URL from terminal (192.168.1.38:3000) on phone
3. **Network**: Both your machine and others on WiFi can access the demo
4. **Production build**: `npm run build` creates optimized version
5. **TypeScript**: Catches errors before runtime

---

## 📞 Support Info

- **Website**: DocBooking.in
- **City**: Panipat, India
- **Email**: demo@docbooking.in
- **Version**: 0.1.0 (Demo)
- **Status**: ✅ Ready to Show

---

## ✨ Show This to Hospitals!

This fully functional demo is perfect for:
- ✅ Quick pitches to hospital admins
- ✅ Investor demos
- ✅ User testing with real doctors
- ✅ Feedback collection
- ✅ Design validation

The backend can be added later. This proves the concept works!

---

**🎉 Ready? Open http://localhost:3000 NOW!**

Enjoy! 🚀
