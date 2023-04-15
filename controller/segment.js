import { Segment, selectSegmentNames, updateSegment, selectAllSegment } from "../model/segment.js";
import { selectCity, matchMember } from "../model/member.js";

// save segment to DB
const postSegment = async (req, res) => {
    const { body } = req;
    const { name, query } = body;
    console.log("name", name);
    console.log("query", query);
    //資料驗證

    // const owner?

    try {
        const segment = new Segment(body);
        const newSegment = await segment.save(body);
        console.log("saved segment to database");
        return res.status(201).json(newSegment);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ data: e.message });
    }
};

// get all segments(create campaign page)
const getSegmentName = async (req, res) => {
    try {
        const names = await selectSegmentNames();
        return res.status(200).json({ data: names });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: e });
    }
};

// get all cities
const getCity = async (req, res) => {
    try {
        const city = await selectCity();
        const cities = city.map((item) => item.city);
        const uniqueCities = [...new Set(cities)];
        return res.status(200).json({ data: uniqueCities });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: e.message });
    }
};

// TODO update segment (放在編輯頁的 save button)
const updateAllSegment = async (req, res) => {
    const newQuery = req.body.query;
    try {
        const updated = await updateSegment(newQuery);
        return res.status(200).json({ data: "updated" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: e.message });
    }
};

// TODO get segment list
const getAllSegment = async (req, res) => {
    try {
        const allSegments = await selectAllSegment();
        return res.status(200).json({ data: allSegments });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: e });
    }
};

// TODO:get member count based on segment filter
const countMember = async (req, res) => {
    const { query } = req.body;
    try {
        const memberCounts = await matchMember(query);
        return res.status(200).json({ data: memberCounts });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: e });
    }
};

export { postSegment, getSegmentName as getSegment, getCity, getAllSegment, countMember };
