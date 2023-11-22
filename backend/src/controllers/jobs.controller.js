import { Job } from "../models/jobs.model.js";
import { User } from "../models/user.model.js";
import validator from "validator";

export async function getJobs(req, res) {
    console.log("The getJobs controller is triggered")
    //Logic to get jobs if any filers on type of jobs then do so in query ;

    const JobsPosted = await Job.find({ isOpen: true });
    res.status(200).json(JobsPosted);

    //also send only 10 jobs or so ..

    // do pagination;
}

export async function getSingleJob(req, res) {
    console.log("============================================================")
    console.log("A request is made to get details of Job with jobId: " + req.params.jobId)
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    console.log("Sending back data of " + job.jobTitle)
    res.status(200).json(job);
    console.log("============================================================")
}

export async function saveJob(req, res) {
    const userId = req.body.user._id;
    const jobId = req.body._id;
    console.log("A request is made to save job with jobId: " + jobId);
    try {

        // Update the user's savedJob field with the new job ID
        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $addToSet: { savedJobs: jobId } }, // Use $addToSet to avoid duplicates
            { new: true }
        );

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function deleteSavedJob(req, res) {

    const userId = req.body.user._id;
    const jobId = req.body.jobId;

    try {

        // Find the user and pull the jobId from their savedJobs array
        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { savedJobs: jobId } },
            { new: true }
        );

        res.status(200).json({ user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}

export async function openJobsCount(req, res,) {
    console.log("================================================")
    console.log(`(openJobsCount Controller)A request is made to get count of open jobs ${new Date().toLocaleString()}`)
    try {
        const openJobsCount = await Job.countDocuments({ isOpen: true });
        res.status(200).json({ openJobsCount });
        console.log("================================================")
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("================================================")
}

export async function addJob(req, res) {
    console.log("================================================")
    console.log(`(addJob Controller): a new job is being added on ${new Date().toLocaleString()}`);
    //Logic to add jobs and insert into database
    const {
        jobTitle,
        jobDescription,
        companyName,
        responsibilities,
        qualifications,
        location,
        salary,
        skills,
        isOpen,
    } = req.body;

    const postedBy = req.body.user._id;

    // Validate required fields
    if (
        !jobTitle ||
        !jobDescription ||
        !companyName ||
        !responsibilities ||
        !qualifications ||
        !location ||
        !salary
    ) {
        return res.status(400).json({ error: "Required fields missing" });
    }

    // Prepare job object
    const jobData = {
        jobTitle,
        jobDescription,
        companyName,
        responsibilities,
        qualifications,
        location,
        salary,
        skills, // optional
        isOpen, // optional, defaults to true
        postedBy,
    };
    //Remove null value filleds from object
    Object.keys(jobData).forEach((key) => {
        if (jobData[key] === null || jobData[key] === undefined) {
            delete jobData[key];
        }
    });

    //validtors

    if (!jobData?.jobTitle?.trim()) return res.send({ error: "jobTitle is required" });
    else {

        if (!validator.isLength(jobData.jobTitle, { min: 5, max: 50 }))
            return res.send({ error: "Invalid job title" });
    }

    if (!jobData?.jobDescription?.trim()) return res.send({ error: "jobDescription is required" });

    if (!jobData?.companyName?.trim()) return res.send({ error: "companyName is required" });
    else {

        if (!validator.isLength(jobData.companyName, { min: 3, max: 50 }))
            return res.send({ error: "Invalid company name" });
    }

    if (!jobData?.responsibilities?.trim()) return res.send({ error: "responsibilities is required" });
    if (!jobData?.qualifications?.trim()) return res.send({ error: "qualifications is required" });
    if (!jobData?.location?.trim()) return res.send({ error: "location is required" });
    if (!jobData?.salary?.trim()) return res.send({ error: "salary is required" });

    // Insert job
    try {
        const job = await Job.create(jobData);
        //Log the info:
        console.log("The job has been created: ", job);

        // Send response
        res.status(201).json(job);
        console.log("================================================");
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error creating job" });
    }

    //send back some response ;
}
