const { scrapeGoogleJobs } = require('./googleScraper');
const { scrapeNetflixJobs } = require('./netflixScraper');
const {
  scrapeAnthropicJobs, scrapeStripeJobs, scrapeAirbnbJobs,
  scrapeDatabricksJobs, scrapeCloudflareJobs, scrapeCoinbaseJobs,
  scrapeFigmaJobs, scrapeScaleAIJobs, scrapeDropboxJobs,
  scrapeInstacartJobs, scrapeLyftJobs, scrapeRedditJobs,
  scrapeRobinhoodJobs, scrapeTwilioJobs, scrapePinterestJobs,
} = require('./greenhouseScraper');

module.exports = {
  scrapeGoogleJobs, scrapeNetflixJobs,
  scrapeAnthropicJobs, scrapeStripeJobs, scrapeAirbnbJobs,
  scrapeDatabricksJobs, scrapeCloudflareJobs, scrapeCoinbaseJobs,
  scrapeFigmaJobs, scrapeScaleAIJobs, scrapeDropboxJobs,
  scrapeInstacartJobs, scrapeLyftJobs, scrapeRedditJobs,
  scrapeRobinhoodJobs, scrapeTwilioJobs, scrapePinterestJobs,
};