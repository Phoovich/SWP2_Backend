const Booking = require('../models/Booking');
const Campground = require('../models/Campground');

//@desc Get all bookings
//@route GET /api/v1/bookings
//@access Public
exports.getBookings = async (req, res, next) => {
    let query;
    //General users can see only their bookings!
    if(req.user.role !== 'admin') {
        query = Booking.find({user:req.user.id}).populate({
            path: 'campground',
            select: 'name province tel'
        });
    } else { // If you are an admin, you can see all!
        if(req.params.campgroundId) {
            console.log(req.params.campgroundId);
            query = Booking.find().populate({
                path: 'campground',
                select: 'name province tel'
            });
        } else {
            query = Booking.find().populate({
                path: 'campground',
                select: 'name province tel'
            });
        }
    }
    try {
        const bookings = await query;

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot find Booking"});
    }
};

//@desc Get single booking
//@route GET /api/v1/bookings/:id
//@access Public
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'campground',
            select: 'name description tel'
        });

        if(!booking) {
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot find Booking"});
    }
};

//@desc Add booking
//@route POST /api/v1/campgrounds/:campgroundId/booking
//@access Private
exports.addBooking = async (req, res, next) => {
    try {
        //add user Id to req.boody
        req.body.campground = req.params.campgroundId;

        const { checkInDate, checkOutDate } = req.body;

        // Convert to Date objects
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        // Ensure checkOut is after checkIn
        if (checkOut <= checkIn) {
            return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
        }

        // Calculate the difference in nights
        const diffInTime = checkOut.getTime() - checkIn.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);

        if (diffInDays > 3) {
            return res.status(400).json({ success: false, message: "You can only book for up to 3 nights." });
        }

        const campground = await Campground.findById(req.params.campgroundId);

        if(!campground) {
            return res.status(404).json({success: false, message: `No campground with the id of ${req.params.campgroundId}`});
        }

        const booking = await Booking.create(req.body);

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot create Booking"});
    }
};

//@desc Update booking
//@route PUT /api/v1/bookings/:id
//@access Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if(!booking) {
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});
        }

        //Make sure user is the booking owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this booking`});
        }

        // Validate the new dates
        const { checkInDate, checkOutDate } = req.body;

        if (checkInDate && checkOutDate) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);

            // Ensure check-out is after check-in
            if (checkOut <= checkIn) {
                return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
            }

            // Calculate the difference in nights
            const diffInTime = checkOut.getTime() - checkIn.getTime();
            const diffInDays = diffInTime / (1000 * 3600 * 24);

            if (diffInDays > 3) {
                return res.status(400).json({ success: false, message: "You can only book for up to 3 nights." });
            }
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true, 
            data: booking
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot update Booking"});
    }
};

//@desc Delete booking
//@route DELETE /api/v1/booking/:id
//@access Private
exports.deleteBooking = async(req, res, next) => {
    try {

        const booking = await Booking.findById(req.params.id);

        if(!booking) {
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});
        }

         //Make sure user is the booking owner
         if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this booking`});
        }

        await booking.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch(error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot delete Booking"});
    }
};