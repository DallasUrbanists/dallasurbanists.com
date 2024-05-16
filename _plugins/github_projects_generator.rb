require 'net/http'
require 'uri'
require 'json'

module GithubProjectsGenerator
    class GithubProjectsGenerator < Jekyll::Generator
        safe true
        
        def generate(site)
            site.data["github_projects"] = {};

            # Only attempt to import projects from GitHub if ENV variable is set.
            # If ENV variable is missing, this plugin will do nothing
            if (ENV["GH_ACCESS_TOKEN"])
                fetchProjectsForCollection("petitions", site)
                fetchProjectsForCollection("writtencomments", site)    
            end
        end

        def fetchProjectsForCollection(collection_name, site)
=begin
            site.collections[collection_name].docs.each do |doc|
                if (doc.data["github_project_id"])
                    project_id = doc.data["github_project_id"]

                    if (!site.data["github_projects"].has_key?(project_id))
                        site.data["github_projects"][project_id] = fetchProjectFromGithub(project_id, site)
                    end

                    doc.data["github_project"] = site.data["github_projects"][project_id]
                end
            end
=end
        end

        def fetchProjectFromGithub(project_id, site)
            uri = URI.parse("https://api.github.com/graphql")
            request = Net::HTTP::Post.new(uri)
            request["Authorization"] = "Bearer #{ENV["GH_ACCESS_TOKEN"]}"
            request.body = JSON.dump({ "query" => queryForProjectV2ById(project_id) })

            response = Net::HTTP.start(uri.hostname, uri.port, { use_ssl: uri.scheme == "https" }) do |http|
                http.request(request)
            end

            responseBody = JSON.parse(response.body)["data"]["node"]

            {
                "title" => responseBody["title"],
                "description" => responseBody["shortDescription"],
                "url" => responseBody["url"],
                "last_sync" => DateTime.now,
                "tasks" => responseBody["items"]["edges"].map { |edge|
                    node = edge["node"]
                    {
                        "id" => node["id"],
                        "title" => node["content"]["title"],
                        "status" => node["content"]["state"] ||= "DRAFT",
                        "body" => node["content"]["body"],
                        "target_date" => node["fieldValueByName"]["date"],
                        "assignee" => node["content"]["assignees"]["nodes"].map { |assignee| assignee["login"] },
                        "history" => node["content"]["timelineItems"] ? node["content"]["timelineItems"]["edges"].map { |timelineItem|
                            item = timelineItem["node"]

                            case item["__typename"]
                                when "AssignedEvent"
                                    {
                                        "type" => item["__typename"],
                                        "actor" => item["actor"]["login"],
                                        "actor_avatar" => item["actor"]["avatarUrl"],
                                        "assignee" => item["assignee"]["login"],
                                        "assignee_avatar" => item["assignee"]["avatarUrl"],
                                        "message" => "Assigned task to #{item["assignee"]["login"]}"
                                    }
                            
                                when "IssueComment"
                                    {
                                        "type" => item["__typename"],
                                        "actor" => item["author"]["login"],
                                        "actor_avatar" => item["author"]["avatarUrl"],
                                        "message" => item["body"],
                                        "url" => item["url"]
                                    }

                                else
                                    {
                                        "type" => item["__typename"],
                                        "details" => item
                                    }
                            end
                        } : []
                    }
                }
            }
        end

        def queryForProjectV2ById(project_id)
            <<-GRAPHQL
                query{
                    node(id: "#{project_id}") {
                        ... on ProjectV2 {
                            title,
                            shortDescription,
                            url,
                            items(last: 100) {
                                edges {
                                node {
                                    id
                                    fieldValueByName(name:"Target Date") {
                                        ... on ProjectV2ItemFieldDateValue {
                                            date
                                        }
                                    }
                                    content {
                                    ... on DraftIssue {
                                        title
                                        body
                                        assignees(last: 5) {
                                        nodes {
                                            login
                                        }
                                        }
                                    }
                                    ... on Issue {
                                        title
                                        state
                                        body
                                        assignees(last: 5) {
                                        nodes {
                                            login
                                        }
                                        }
                                        timelineItems(last: 40) {
                                            edges {
                                                node {
                                                ... on AddedToProjectEvent {
                                                    actor {
                                                    avatarUrl
                                                    login
                                                    }
                                                    createdAt
                                                    __typename
                                                }
                                                ... on ClosedEvent {
                                                    actor {
                                                    avatarUrl
                                                    login
                                                    }
                                                    createdAt
                                                    __typename
                                                }
                                                ... on IssueComment {
                                                    author {
                                                    avatarUrl
                                                    login
                                                    }
                                                    body
                                                    createdAt
                                                    url
                                                    __typename
                                                }
                                                ... on RenamedTitleEvent {
                                                    actor {
                                                    avatarUrl
                                                    login
                                                    }
                                                    createdAt
                                                    currentTitle
                                                    previousTitle
                                                    __typename
                                                }
                                                ... on ReopenedEvent {
                                                    actor {
                                                    avatarUrl
                                                    login
                                                    }
                                                    createdAt
                                                    __typename
                                                }
                                                ... on UnassignedEvent {
                                                    actor {
                                                    avatarUrl
                                                    login
                                                    }
                                                    createdAt
                                                    assignee {
                                                    ... on User {
                                                        avatarUrl
                                                        login
                                                    }
                                                    }
                                                    __typename
                                                }
                                                ... on AssignedEvent {
                                                    actor {
                                                    avatarUrl
                                                    login
                                                    }
                                                    assignee {
                                                    ... on User {
                                                        avatarUrl
                                                        login
                                                    }
                                                    }
                                                    __typename
                                                }
                                                ... on ClosedEvent {
                                                    actor {
                                                    avatarUrl
                                                    login
                                                    }
                                                    createdAt
                                                    __typename
                                                }
                                                }
                                            }
                                            }
                                    }
                                    }
                                }
                                }
                            }
                        }
                    }
                }
            GRAPHQL
        end
    end
end