# System Patterns

## How the System is Built

The system is a static UI application built on top of a Sanity CMS. Additionally, there is a PostgreSQL database setup for users profile information, forum posts, product reviews, and eventually bookmarks. There are also multiple services generating RSS feeds that are consumed by third party applications such as dlvr.it and IFFFT to post this content automatically on various social media platforms.

## Key Technical Decisions

It was crucial to separate the content created by the editors of the website, and the user generated content. We opted for Auth0 as our authentication layer, as it provides flexibility and reliability.

## Architecture Patterns

This is a micro service architecture, where each component is in charge of its own business domain: Sanity CMS for the editor content and Prisma/PostgreSQL for the user generated content.
