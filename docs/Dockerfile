FROM "ruby:2.7.1"
WORKDIR /systems-integration/docs
COPY Gemfile /systems-integration/docs
RUN apt-get update
RUN apt-get -y install rsync default-jre graphviz ghostscript
RUN bundle install 
CMD ruby -run -e httpd /systems-integration/docs/output
