Feature: Users and groups

  Scenario: Test
    Given I am the user "m+userAndGroups@mhn.me" in group "admin"
    When I create the group "bdd"
    When I create the user "m@mhn.me" in group "bdd"
    Then I log the results