import { createSegment, selectSegmentNames, updateSegment, selectAllSegment, selectById } from "../model/segment.js";
import { selectCity, matchMember } from "../model/member.js";

const postSegment = async (req, res) => {
    const { body } = req;
    const { name } = body;
    if (!name) {
        return res.status(400).json({ data: "Name field is required." });
    }

    body.owner = req.payload.name;

    await createSegment(body);
    return res.status(201).json({ data: "Segment created successfully." });
};

// create campaign page
const getSegmentName = async (req, res) => {
    const names = await selectSegmentNames();
    return res.status(200).json({ data: names });
};

const getCity = async (req, res) => {
    const city = await selectCity();
    const cities = city.map((item) => item.city);
    const uniqueCities = [...new Set(cities)];
    return res.status(200).json({ data: uniqueCities });
};

const updateSegmentDetail = async (req, res) => {
    const { id, query, name, rules } = req.body;
    if (!id || !query || !name || !rules) {
        return res.status(400).json({ data: "bad request" });
    }

    const updatedSegment = await updateSegment(id, query, name, rules);
    if (!updatedSegment) {
        return res.status(400).json({ data: "no matched segment with request id." });
    }
    return res.status(200).json({ data: "updated" });
};

const getAllSegment = async (req, res) => {
    const allSegments = await selectAllSegment();
    return res.status(200).json({ data: allSegments });
};

const getSegmentById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ data: "bad request" });
    }

    const detail = await selectById(id);
    if (!detail) {
        return res.status(400).json({ data: "no matched segment with request id " });
    }
    return res.status(200).json({ data: detail });
};

const countMember = async (req, res) => {
    const { query } = req.body;
    const memberCounts = await matchMember(query);
    return res.status(200).json({ data: memberCounts });
};

export { postSegment, getSegmentName, getCity, getAllSegment, getSegmentById, countMember, updateSegmentDetail };
