// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

// Global data stores
let businessesData = [];
let employees = [];
let reviews = [];
let meetings = [];
let news = [];
let documents = [];

// Filters state
let currentStatusFilter = "all";
let currentTypeFilter = "all";

// Admin state
let isAdmin = false;
let unsubscribeFunctions = [];

// Current editing items
let currentBizId = null;
let pendingImageBizId = null;
let pendingEmployeeId = null;
let currentBusinessForDelete = null;

console.log("Firebase initialized");