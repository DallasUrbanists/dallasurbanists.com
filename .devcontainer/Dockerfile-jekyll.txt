FROM python:3.10

RUN apt-get update
RUN apt-get install -y ruby-full && gem install bundler

COPY Gemfile Gemfile
COPY Gemfile.lock Gemfile.lock
RUN bundle install
