import React, { useState, useEffect } from "react";
import { Box, Button, Container, Flex, Heading, Input, List, ListItem, Stack, Tag, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Textarea, Select, Alert, AlertIcon } from "@chakra-ui/react";
import { FaSearch, FaEdit, FaTrashAlt } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = "https://your-supabase-url.com";
const supabaseKey = "your-supabase-key";
const supabase = createClient(supabaseUrl, supabaseKey);

const Index = () => {
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentQuote, setCurrentQuote] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredQuotes, setFilteredQuotes] = useState([]);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    let { data, error } = await supabase.from("quotes").select();
    if (error) {
      setError("Error fetching quotes");
    } else {
      setQuotes(data);
      setFilteredQuotes(data);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setFilteredQuotes(quotes);
    } else {
      setFilteredQuotes(quotes.filter((quote) => quote.text.toLowerCase().includes(e.target.value.toLowerCase()) || (quote.author && quote.author.toLowerCase().includes(e.target.value.toLowerCase()))));
    }
  };

  const openModal = (quote) => {
    setCurrentQuote(quote);
    onOpen();
  };

  const closeModal = () => {
    setCurrentQuote({});
    onClose();
  };

  const handleDelete = async (id) => {
    const { data, error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) {
      setError("Error deleting quote");
    } else {
      fetchQuotes();
      closeModal();
    }
  };

  return (
    <Container maxW="container.md">
      <Heading my={8}>Quote Manager</Heading>
      <Input placeholder="Search quotes..." value={searchTerm} onChange={handleSearch} mb={4} leftIcon={<FaSearch />} />
      <Stack spacing={4}>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <List>
            {filteredQuotes.map((quote) => (
              <ListItem key={quote.id} p={4} borderWidth="1px" borderRadius="md" mb={2}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">{quote.text}</Text>
                    <Text color="gray.500">{quote.author}</Text>
                    <Tag mt={2}>{quote.category}</Tag>
                  </Box>
                  <Flex>
                    <Button size="sm" leftIcon={<FaEdit />} onClick={() => openModal(quote)} mr={2}>
                      Edit
                    </Button>
                    <Button size="sm" colorScheme="red" leftIcon={<FaTrashAlt />} onClick={() => handleDelete(quote.id)}>
                      Delete
                    </Button>
                  </Flex>
                </Flex>
              </ListItem>
            ))}
          </List>
        )}
      </Stack>

      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Quote Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Text</FormLabel>
              <Textarea value={currentQuote.text} isReadOnly />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Author</FormLabel>
              <Input value={currentQuote.author || ""} isReadOnly />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Category</FormLabel>
              <Select placeholder="Select option" isReadOnly>
                <option value={currentQuote.category}>{currentQuote.category}</option>
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={closeModal}>
              Close
            </Button>
            <Button colorScheme="red" onClick={() => handleDelete(currentQuote.id)}>
              Delete Quote
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Index;
