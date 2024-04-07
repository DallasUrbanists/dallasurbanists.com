require_relative '../_plugins/github_projects_generator'

class MockDocument 
    attr_reader :data
    attr_writer :data

    def initialize(data)
        @data = data
    end
end

class MockCollection
    attr_reader :docs
    attr_writer :docs

    def initialize(docs)
        @docs = docs
    end
end

class MockSite
    attr_reader :data, :collections
    attr_writer :data, :collections

    def initialize
        @data = {}
        @collections = {
            "petitions" => MockCollection.new([
                MockDocument.new({ "title" => "Stub 1", "github_project_id" => "PVT_kwDOB7zCnM4AfeDY" }),
                MockDocument.new({ "title" => "Stub 2" })
            ]),
            "writtencomments" => MockCollection.new([
                MockDocument.new({ "title" => "Stub 3", "github_project_id" => "PVT_kwDOB7zCnM4AfeDY" }),
                MockDocument.new({ "title" => "Stub 4" })
            ])
        }
    end
end

site = MockSite.new

my_generator = GithubProjectsGenerator::GithubProjectsGenerator.new

my_generator.generate(site)

site.collections["petitions"].docs.each do |doc|
    puts JSON.pretty_generate(doc.data)
end
site.collections["writtencomments"].docs.each do |doc|
    puts JSON.pretty_generate(doc.data)
end

#puts JSON.pretty_generate(results)